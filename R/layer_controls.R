#' Functions relating to layer controls on the map.
#'
#' Functions:
#' - add_tile_selector_control:     Add a tile selector control to the map or control panel.
#' - remove_tile_selector_control:  Remove the tile selector control from the map.
#' - add_layer_selector_control:    Add a layer selector control to the map or control panel.
#' - remove_layer_selector_control: Remove the layer selector control from the map.
#' - add_cluster_toggle:            Add a cluster toggle control to the map or control panel.
#' - remove_cluster_toggle:         Remove a cluster toggle control from the map.

#' Add a tile selector control to the map or control panel
#'
#' @param map           The map or map proxy object.
#' @param available_tiles Vector of available tile options. If NULL, uses all loaded tiles from the map.
#' @param labels        Named vector of labels for tiles. If NULL, uses tile names directly.
#' @param default_tile  Default tile to select. If NULL, uses current map tile.
#' @param position      Position on the map if not using a control panel. Default is "top-right".
#' @param panel_id      ID of control panel to add to (optional).
#' @param section_title Section title when added to a control panel.
#' @return              The map or map proxy object for chaining.
#' @export
add_tile_selector_control <- function(
  map,
  available_tiles = NULL,
  labels = NULL,
  default_tile = NULL,
  position = "top-right",
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
) {
  # If no tiles specified, get them from the map's loaded tiles
  # if (is.null(available_tiles)) {
  #   if (inherits(map, "mapProxy")) {
  #     # For proxy, we'll need to get this from the map instance in JS
  #     available_tiles <- get_tile_options() # Fallback to all options
  #   } else {
  #     # For initial map creation, get from map object
  #     available_tiles <- map$x$loadedTiles %||% get_tile_options()
  #   }
  # }

  # Create default labels if not provided
  if (is.null(labels)) {
    labels <- setNames(
      c(
        "National Geographic",
        "Satellite",
        "Topographic",
        "Terrain",
        "Streets",
        "Shaded",
        "Light Grey"
      )[
        match(
          available_tiles,
          c("natgeo", "satellite", "topo", "terrain", "streets", "shaded", "light-grey")
        )
      ],
      available_tiles
    )
    labels <- labels[!is.na(labels)]
  }

  # Ensure labels is a named vector
  if (is.null(names(labels))) {
    names(labels) <- available_tiles[seq_along(labels)]
  }

  options <- list(
    availableTiles = available_tiles,
    labels = as.list(labels),
    defaultTile = default_tile,
    position = position,
    useControlPanel = !is.null(panel_id),
    panelId = panel_id,
    panelTitle = section_title,
    groupId = group_id
  )

  if (inherits(map, "mapProxy")) {
    if (!is.null(panel_id)) {
      # Add to control panel
      add_control_to_panel(map, panel_id, "tile-selector", options, section_title, group_id)
    } else {
      # Add as standalone control
      map$session$sendCustomMessage(
        "addTileSelectorControlStandalone",
        list(id = map$id, options = options)
      )
    }
  } else {
    # Store for initial map creation
    if (is.null(map$x$tileSelectorControls)) {
      map$x$tileSelectorControls <- list()
    }
    control_id <- if (!is.null(panel_id)) {
      paste0(panel_id, "-tile-selector")
    } else {
      "standalone_tile_selector"
    }
    map$x$tileSelectorControls[[control_id]] <- options
  }

  map
}

#' Remove the tile selector control from the map.
#'
#' @param proxy     The map proxy object created by `mapProxy()`.
#' @param panel_id  Optional. If provided, removes the tile selector control from the specified control panel.
#'                  If NULL, removes the standalone tile selector control.
#' @return          The map proxy object for chaining.
#' @export
remove_tile_selector_control <- function(proxy, panel_id = NULL) {
  # Use the namespaced control ID pattern: tile-selector-{mapId}
  control_id <- paste0("tile-selector-", proxy$id)

  if (!is.null(panel_id)) {
    # Remove from control panel
    remove_control_from_panel(proxy, panel_id, control_id)
  } else {
    # Remove standalone control
    remove_control(proxy, control_id)
  }
}

#' Add a layer selector control to the map or control panel
#'
#' Creates a dropdown selector that allows switching between layers, showing only the
#' selected layer while hiding all others. This is useful for comparing different
#' data layers or allowing users to choose between mutually exclusive visualizations.
#'
#' @param map            The map or map proxy object.
#' @param layer_ids      Vector of layer IDs to include in the selector.
#' @param labels         Named vector of labels for layers. If NULL, uses layer IDs directly.
#' @param default_layer  Default layer to select. If NULL, uses the first layer.
#' @param none_option    Whether to include a "None" option that hides all layers. Default is FALSE.
#' @param none_label     Label for the "None" option. Default is "None".
#' @param position       Position on the map if not using a control panel. Default is "top-right".
#' @param panel_id       ID of control panel to add to (optional).
#' @param section_title  Section title when added to a control panel.
#' @param group_id       ID of control group to add to (optional).
#' @return               The map or map proxy object for chaining.
#' @export
#'
#' @examples
#' if (interactive()) {
#'   # Create a map with multiple layers
#'   map() %>%
#'     add_circle_layer("points", data1, id = "layer1") %>%
#'     add_fill_layer("polygons", data2, id = "layer2") %>%
#'     add_layer_selector_control(
#'       layer_ids = c("layer1", "layer2"),
#'       labels = c("layer1" = "Points", "layer2" = "Polygons"),
#'       default_layer = "layer1"
#'     )
#' }
add_layer_selector_control <- function(
  map,
  layer_ids,
  labels = NULL,
  default_layer = NULL,
  none_option = FALSE,
  none_label = "None",
  position = "top-right",
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
) {
  # Use layer IDs as labels if not provided
  if (is.null(labels)) {
    labels <- setNames(layer_ids, layer_ids)
  }

  # Ensure labels is a named vector
  if (is.null(names(labels))) {
    names(labels) <- layer_ids[seq_along(labels)]
  }

  # Set default layer if not provided
  if (is.null(default_layer)) {
    default_layer <- layer_ids[1]
  }

  # Add none option if requested
  if (none_option) {
    layer_ids <- c("none", layer_ids)
    labels <- c(setNames(none_label, "none"), labels)
  }

  options <- list(
    layerIds = layer_ids,
    labels = as.list(labels),
    defaultLayer = default_layer,
    noneOption = none_option,
    position = position,
    useControlPanel = !is.null(panel_id),
    panelId = panel_id,
    panelTitle = section_title,
    groupId = group_id
  )

  if (inherits(map, "mapProxy")) {
    if (!is.null(panel_id)) {
      # Add to control panel
      add_control_to_panel(map, panel_id, "layer-selector", options, section_title, group_id)
    } else {
      # Add as standalone control
      map$session$sendCustomMessage(
        "addLayerSelectorControlStandalone",
        list(id = map$id, options = options)
      )
    }
  } else {
    # Store for initial map creation
    if (is.null(map$x$layerSelectorControls)) {
      map$x$layerSelectorControls <- list()
    }
    control_id <- if (!is.null(panel_id)) {
      paste0(panel_id, "-layer-selector")
    } else {
      "standalone_layer_selector"
    }
    map$x$layerSelectorControls[[control_id]] <- options
  }

  map
}

#' Remove the layer selector control from the map.
#'
#' @param proxy     The map proxy object created by `mapProxy()`.
#' @param panel_id  Optional. If provided, removes the layer selector control from the specified control panel.
#'                  If NULL, removes the standalone layer selector control.
#' @return          The map proxy object for chaining.
#' @export
remove_layer_selector_control <- function(proxy, panel_id = NULL) {
  # Use the namespaced control ID pattern: layer-selector-{mapId}
  control_id <- paste0("layer-selector-", proxy$id)

  if (!is.null(panel_id)) {
    # Remove from control panel
    remove_control_from_panel(proxy, panel_id, control_id)
  } else {
    # Remove standalone control
    remove_control(proxy, control_id)
  }
}

#' Add a cluster toggle control to the map or control panel
#'
#' Creates a toggle button that can enable/disable clustering for a specific layer.
#'
#' @param map           The map or map proxy object.
#' @param layer_id      ID of the layer to toggle clustering for.
#' @param control_id    ID for the control. If NULL, defaults to "cluster-toggle-{layer_id}".
#' @param left_label    Label text for the toggle button. Default is "Toggle Clustering".
#' @param right_label   Label text for the toggle button when clustering is off. Default
#' @param initial_state Initial clustering state. Default is FALSE.
#' @param position      Position on the map if not using a control panel. Default is "top-right".
#' @param panel_id      ID of control panel to add to (optional).
#' @param section_title Section title when added to a control panel.
#' @return              The map or map proxy object for chaining.
#' @export
add_cluster_toggle <- function(
  map,
  layer_id,
  control_id = NULL,
  left_label = "Toggle Clustering",
  right_label = NULL,
  initial_state = FALSE,
  position = "top-right",
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
) {
  if (is.null(control_id)) {
    control_id <- paste0("cluster-toggle-", layer_id)
  }

  options <- list(
    controlId = control_id,
    layerId = layer_id,
    leftLabel = left_label,
    rightLabel = right_label,
    initialState = initial_state,
    position = position,
    panelId = panel_id,
    panelTitle = section_title,
    groupId = group_id
  )

  if (inherits(map, "mapProxy")) {
    if (!is.null(panel_id)) {
      # Add to control panel
      add_control_to_panel(map, panel_id, "cluster-toggle", options, section_title, group_id)
    } else {
      # Add as standalone control
      map$session$sendCustomMessage(
        "addClusterToggleControl",
        list(id = map$id, options = options)
      )
    }
  } else {
    # Store for initial map creation
    if (is.null(map$x$clusterToggleControls)) {
      map$x$clusterToggleControls <- list()
    }
    map$x$clusterToggleControls[[control_id]] <- options
  }

  map
}


#' Remove a cluster toggle control from the map
#'
#' @param proxy       The map proxy object created by `mapProxy()`.
#' @param layer_id    The ID of the layer whose cluster toggle control to remove.
#' @param panel_id    Optional. If provided, removes the control from the specified control panel.
#' @return            The map proxy object for chaining.
#' @export
remove_cluster_toggle <- function(proxy, layer_id, panel_id = NULL) {
  # Generate the control ID to match the JavaScript pattern: cluster-toggle-{layerId}-{widgetId}
  control_id <- paste0("cluster-toggle-", layer_id, "-", proxy$id)

  if (!is.null(panel_id)) {
    # Remove from control panel
    remove_control_from_panel(proxy, panel_id, control_id)
  } else {
    # Remove standalone control
    remove_control(proxy, control_id)
  }
}


#' Add a visibility toggle control to the map or control panel
#'
#' Creates a toggle button that can show/hide a specific layer.
#'
#' @param map           The map or map proxy object.
#' @param layer_id      ID of the layer to toggle visibility for.
#' @param control_id    ID for the control. If NULL, defaults to "visibility-toggle-{layer_id}".
#' @param left_label    Label text for the toggle button. Default is "Toggle Layer".
#' @param right_label   Label text for the toggle button when layer is hidden. Default
#' @param initial_state Initial visibility state. Default is TRUE.
#' @param position      Position on the map if not using a control panel. Default is "top-right".
#' @param panel_id      ID of control panel to add to (optional).
#' @param section_title Section title when added to a control panel.
#' @return              The map or map proxy object for chaining.
#' @export
add_visibility_toggle <- function(
  map,
  layer_id,
  control_id = NULL,
  left_label = "Toggle Layer",
  right_label = NULL,
  initial_state = TRUE,
  position = "top-right",
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
) {
  if (is.null(control_id)) {
    control_id <- paste0("visibility-toggle-", layer_id)
  }

  options <- list(
    controlId = control_id,
    layerId = layer_id,
    leftLabel = left_label,
    rightLabel = right_label,
    initialState = initial_state,
    position = position,
    panelId = panel_id,
    panelTitle = section_title,
    groupId = group_id
  )

  if (inherits(map, "mapProxy")) {
    if (!is.null(panel_id)) {
      # Add to control panel
      add_control_to_panel(map, panel_id, "visibility-toggle", options, section_title, group_id)
    } else {
      # Add as standalone control
      map$session$sendCustomMessage(
        "addVisibilityToggleControl",
        list(id = map$id, options = options)
      )
    }
  } else {
    # Store for initial map creation
    if (is.null(map$x$visibilityToggleControls)) {
      map$x$visibilityToggleControls <- list()
    }
    map$x$visibilityToggleControls[[control_id]] <- options
  }

  map
}


#' Remove a visibility toggle control from the map
#'
#' @param proxy       The map proxy object created by `mapProxy()`.
#' @param layer_id    The ID of the layer whose visibility toggle control to remove.
#' @param panel_id    Optional. If provided, removes the control from the specified control panel.
#' @return            The map proxy object for chaining.
#' @export
remove_visibility_toggle <- function(proxy, layer_id, panel_id = NULL) {
  # Generate the control ID to match the JavaScript pattern: visibility-toggle-{layerId}-{widgetId}
  control_id <- paste0("visibility-toggle-", layer_id, "-", proxy$id)

  if (!is.null(panel_id)) {
    # Remove from control panel
    remove_control_from_panel(proxy, panel_id, control_id)
  } else {
    # Remove standalone control
    remove_control(proxy, control_id)
  }
}
