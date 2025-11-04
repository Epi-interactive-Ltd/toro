#' Utilities for the map related to controls.
#'
#' Functions:
#' - `toggle_control`:            Toggle the visibility of a control on the map.
#' - `add_cursor_coords_control`: Add a cursor coordinates control to the map.
#' - `add_draw_control`:          Add a draw control to the map.
#' - `add_zoom_control`:          Add a zoom control to the map.
#' - `add_custom_control`:        Add a custom HTML control to the map.
#' - `add_control_panel`:         Add a control panel to the map.
#' - `add_control_to_panel`:      Add a control to an existing control panel.
#' - `add_timeline_control`:      Add a timeline control to the map or control panel.
#' - `add_speed_control`:         Add a speed control to the map or control panel.
#' - `delete_drawn_shape`:        Delete a drawn shape from the map.
#' - `remove_control`:            Remove a control from the map.
#' - `remove_draw_control`:       Remove the draw control from the map.
#' - `remove_zoom_control`:       Remove the zoom control from the map.
#' - `remove_cursor_coords_control`: Remove the cursor coordinates control from the map.
#' - `remove_timeline_control`:    Remove the timeline control from the map.
#' - `remove_speed_control`:       Remove the speed control from the map.
#' - `remove_tile_selector_control`: Remove the tile selector control from the map.
#' - `remove_custom_control`:      Remove a custom control from the map.
#' - `add_cluster_toggle`:         Add a cluster toggle control to the map or control panel.
#' - `add_visibility_toggle`:      Add a visibility toggle control to the map or control panel.
#' - `remove_cluster_toggle`:      Remove a cluster toggle control from the map.
#' - `remove_visibility_toggle`:   Remove a visibility toggle control from the map.

#' Toggle the visibility of a control on the map.
#'
#' @param proxy       The map proxy object created by `mapProxy()`.
#' @param control_id  The ID of the control to toggle.
#' @param show        Logical indicating whether to show or hide the control. Default is `TRUE`.
#' @return            The map proxy object for chaining.
#' @export
toggle_control <- function(proxy, control_id, show = TRUE) {
  proxy$session$sendCustomMessage(
    "toggleControl",
    list(
      id = proxy$id,
      controlId = control_id,
      show = show
    )
  )
  proxy
}


#' Add a cursor coordinates control to the map.
#'
#' @param map         The map or map proxy object.
#' @param position    The position of the cursor coordinates control on the map.
#'                    Default is `"bottom-left"`.
#'                    Options include "top-left", "top-right", "bottom-left", "bottom-right".
#' @param long_label  The label for the longitude coordinate. Default is `"Lng"`.
#' @param lat_label   The label for the latitude coordinate. Default is `"Lat"`.
#' @param panel_id    ID of control panel to add to (optional).
#' @param section_title Section title when added to a control panel.
#' @return            The map or map proxy object for chaining.
#' @export
add_cursor_coords_control <- function(
  map,
  position = "bottom-left",
  long_label = "Lng",
  lat_label = "Lat",
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
) {
  control <- list(
    type = "cursor",
    position = position,
    longLabel = long_label,
    latLabel = lat_label,
    panelId = panel_id,
    panelTitle = section_title,
    groupId = group_id
  )

  if (inherits(map, "mapProxy")) {
    if (!is.null(panel_id)) {
      # Add to control panel
      add_control_to_panel(map, panel_id, "cursor", control, section_title, group_id)
    } else {
      # Add as standalone control
      map$session$sendCustomMessage("addCursorCoordsControl", list(id = map$id, control = control))
    }
  } else {
    if (is.null(map$x$cursorControls)) {
      map$x$cursorControls <- control
      map$x$controls <- c(map$x$controls, list(control))
    }
  }
  map
}

#' Add a zoom control to the map.
#'
#' @note See [Maplibre NavigationControl docs](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/NavigationControlOptions/)
#' for more information on available options.
#'
#' @param map           The map or map proxy object.
#' @param position        The position of the zoom control on the map.
#'                        Default is `"top-right"`.
#' @param control_options Additional options for the zoom control.
#'                        Default is an empty list.
#' @param panel_id      ID of control panel to add to (optional).
#' @param section_title Section title when added to a control panel.
#' @return                The map proxy object for chaining.
#' @export
add_zoom_control <- function(
  map,
  position = "top-right",
  control_options = list(),
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
) {
  control_config <- list(
    type = "zoom",
    position = position,
    controlOptions = control_options,
    panelId = panel_id,
    panelTitle = section_title,
    groupId = group_id
  )

  if (inherits(map, "mapProxy")) {
    if (!is.null(panel_id)) {
      # Add to control panel
      add_control_to_panel(map, panel_id, "zoom", control_config, section_title, group_id)
    } else {
      # Add as standalone control
      map$session$sendCustomMessage(
        "addZoomControl",
        list(
          id = map$id,
          position = position,
          controlOptions = control_options
        )
      )
    }
  } else {
    if (is.null(map$x$zoomControl)) {
      map$x$zoomControl <- control_config
      map$x$controls <- c(map$x$controls, list(control_config))
    }
  }
  map
}

#' Add a custom HTML control to the map.
#'
#' @param map         The map or map proxy object.
#' @param id          The ID for the custom control.
#' @param html        The HTML content to add as a control.
#' @param position    The position of the control on the map. Default is `"top-right"`.
#'                    Options include "top-left", "top-right", "bottom-left", "bottom-right".
#' @param panel_id    ID of control panel to add to (optional).
#' @param section_title Section title when added to a control panel.
#' @return            The map or map proxy object for chaining.
#' @export
add_custom_control <- function(
  map,
  id,
  html,
  position = "top-right",
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
) {
  control <- list(
    type = "custom",
    controlId = id,
    html = html,
    position = position,
    panelId = panel_id,
    panelTitle = section_title,
    groupId = group_id
  )

  if (inherits(map, "mapProxy")) {
    if (!is.null(panel_id)) {
      # Add to control panel
      add_control_to_panel(map, panel_id, "custom", control, section_title, group_id)
    } else {
      # Add as standalone control
      map$session$sendCustomMessage(
        "addCustomControl",
        list(id = map$id, options = control)
      )
    }
  } else {
    map$x$customControls <- c(map$x$customControls, list(control))
    map$x$controls <- c(map$x$controls, list(control))
  }
  map
}


#' Add a draw control to the map
#'
#' @param map           The map or map proxy object.
#' @param id            The ID for the draw control.
#' @param position        The position of the draw control on the map. Default is `"top-right"`.
#'                        Options are "top-left", "top-right", "bottom-left", "bottom-right".
#' @param modes           A vector of modes to enable in the draw control.
#'                        Default is `c("polygon", "trash")`.
#'                        Options include "polygon", "trash", "line".
#' @param active_colour   The colour for the drawn shapes. Default is `"#0FB3CE"`.
#' @param inactive_colour The colour for the inactive shapes. Default is `"#0FB3CE"`.
#' @param mode_labels     A named list of labels for each mode.
#'                        For example, `list(polygon = "Draw Polygon", trash = "Delete Shape")`.
#' @param panel_id      ID of control panel to add to (optional).
#' @param section_title Section title when added to a control panel.
#' @return                The map or map proxy object for chaining.
#' @export
add_draw_control <- function(
  map,
  id = "draw_control",
  position = "top-right",
  modes = c("polygon", "trash"),
  active_colour = "#0FB3CE",
  inactive_colour = "#0FB3CE",
  mode_labels = list(),
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
) {
  control <- list(
    type = "draw",
    controlId = id,
    position = position,
    modes = list(modes),
    activeColour = active_colour,
    inactiveColour = inactive_colour,
    modeLabels = mode_labels,
    panelId = panel_id,
    panelTitle = section_title,
    groupId = group_id
  )

  if (inherits(map, "mapProxy")) {
    if (!is.null(panel_id)) {
      # Add to control panel
      add_control_to_panel(map, panel_id, "draw", control, section_title, group_id)
    } else {
      # Add as standalone control
      map$session$sendCustomMessage(
        "addDraw",
        list(id = map$id, options = control)
      )
    }
  } else {
    if (is.null(map$x$drawControl)) {
      map$x$drawControl <- control
      map$x$controls <- c(map$x$controls, list(control))
    }
  }
  map
}

#' Delete a drawn shape from the map.
#'
#' The ID of the shape is provided by the draw control when a shape is created.
#'
#' @param proxy     The map proxy object created by `mapProxy()`.
#' @param shape_id  The ID of the shape to delete.
#' @return          The map proxy object for chaining.
#' @export
delete_drawn_shape <- function(proxy, shape_id) {
  proxy$session$sendCustomMessage("deleteDrawnShape", list(id = proxy$id, shapeId = shape_id))
  proxy
}

#' Remove a control from the map.
#'
#' @param proxy       The map proxy object created by `mapProxy()`.
#' @param control_id  The ID of the control to remove.
#' @return            The map proxy object for chaining.
#' @export
remove_control <- function(proxy, control_id) {
  proxy$session$sendCustomMessage(
    "removeControl",
    list(
      id = proxy$id,
      controlId = control_id
    )
  )
  proxy
}

#' Remove a control from a control panel.
#'
#' @param proxy       The map proxy object created by `mapProxy()`.
#' @param panel_id    The ID of the control panel.
#' @param control_id  The ID of the control to remove from the panel.
#' @return            The map proxy object for chaining.
#' @export
remove_control_from_panel <- function(proxy, panel_id, control_id) {
  proxy$session$sendCustomMessage(
    "removeControlFromPanel",
    list(
      id = proxy$id,
      panelId = panel_id,
      controlId = control_id
    )
  )
  proxy
}

#' Remove the draw control from the map.
#'
#' @param proxy     The map proxy object created by `mapProxy()`.
#' @param panel_id  Optional. If provided, removes the draw control from the specified control panel.
#'                  If NULL, removes the standalone draw control.
#' @return          The map proxy object for chaining.
#' @export
remove_draw_control <- function(proxy, panel_id = NULL) {
  # Use the namespaced control ID pattern: draw-control-{mapId}
  control_id <- paste0("draw-control-", proxy$id)

  if (!is.null(panel_id)) {
    # Remove from control panel
    remove_control_from_panel(proxy, panel_id, control_id)
  } else {
    # Remove standalone control
    remove_control(proxy, control_id)
  }
}

#' Remove the zoom control from the map.
#'
#' @param proxy     The map proxy object created by `mapProxy()`.
#' @param panel_id  Optional. If provided, removes the zoom control from the specified control panel.
#'                  If NULL, removes the standalone zoom control.
#' @return          The map proxy object for chaining.
#' @export
remove_zoom_control <- function(proxy, panel_id = NULL) {
  # Use the namespaced control ID pattern: zoom-control-{mapId}
  control_id <- paste0("zoom-control-", proxy$id)

  if (!is.null(panel_id)) {
    # Remove from control panel
    remove_control_from_panel(proxy, panel_id, control_id)
  } else {
    # Remove standalone control
    remove_control(proxy, control_id)
  }
}

#' Remove the cursor coordinates control from the map.
#'
#' @param proxy     The map proxy object created by `mapProxy()`.
#' @param panel_id  Optional. If provided, removes the cursor coordinates control from the specified control panel.
#'                  If NULL, removes the standalone cursor coordinates control.
#' @return          The map proxy object for chaining.
#' @export
remove_cursor_coords_control <- function(proxy, panel_id = NULL) {
  # Use the namespaced control ID pattern: cursor-coords-{mapId}
  control_id <- paste0("cursor-coords-", proxy$id)

  if (!is.null(panel_id)) {
    # Remove from control panel
    remove_control_from_panel(proxy, panel_id, control_id)
  } else {
    # Remove standalone control
    remove_control(proxy, control_id)
  }
}

#' Remove the timeline control from the map.
#'
#' @param proxy     The map proxy object created by `mapProxy()`.
#' @param panel_id  Optional. If provided, removes the timeline control from the specified control panel.
#'                  If NULL, removes the standalone timeline control.
#' @return          The map proxy object for chaining.
#' @export
remove_timeline_control <- function(proxy, panel_id = NULL) {
  # Use the namespaced control ID pattern: timeline-control-{mapId}
  control_id <- paste0("timeline-control-container-", proxy$id)

  if (!is.null(panel_id)) {
    # Remove from control panel
    remove_control_from_panel(proxy, panel_id, control_id)
  } else {
    # Remove standalone control
    remove_control(proxy, control_id)
  }
}

#' Remove the speed control from the map.
#'
#' @param proxy     The map proxy object created by `mapProxy()`.
#' @param panel_id  Optional. If provided, removes the speed control from the specified control panel.
#'                  If NULL, removes the standalone speed control.
#' @return          The map proxy object for chaining.
#' @export
remove_speed_control <- function(proxy, panel_id = NULL) {
  # Use the namespaced control ID pattern: speed-control-{mapId}
  control_id <- paste0("speed-control-", proxy$id)

  if (!is.null(panel_id)) {
    # Remove from control panel
    remove_control_from_panel(proxy, panel_id, control_id)
  } else {
    # Remove standalone control
    remove_control(proxy, control_id)
  }
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

#' Remove a custom control from the map.
#'
#' @param proxy       The map proxy object created by `mapProxy()`.
#' @param control_id  The ID of the custom control to remove.
#' @param panel_id    Optional. If provided, removes the custom control from the specified control panel.
#'                    If NULL, removes the standalone custom control.
#' @return            The map proxy object for chaining.
#' @export
remove_custom_control <- function(proxy, control_id, panel_id = NULL) {
  if (!is.null(panel_id)) {
    # Remove from control panel
    remove_control_from_panel(proxy, panel_id, control_id)
  } else {
    # Remove standalone control
    remove_control(proxy, control_id)
  }
}

#' Add a control panel to the map
#'
#' Creates a flexible control panel that can contain multiple controls.
#'
#' @param map           The map or map proxy object.
#' @param panel_id      Unique identifier for the control panel.
#' @param title         Title for the control panel. If NULL, no title is shown.
#' @param position      Position of the control panel on the map. Default is "bottom-left".
#'                      Options include "top-left", "top-right", "bottom-left", "bottom-right".
#' @param collapsible   Whether the panel can be collapsed. Default is FALSE.
#' @param collapsed     Initial collapsed state. Default is FALSE.
#' @param custom_controls List of custom controls to add initially. Each should be a list with
#'                      elements: html, id (optional), title (optional).
#' @return              The map or map proxy object for chaining.
#' @export
add_control_panel <- function(
  map,
  panel_id,
  title = NULL,
  position = "bottom-left",
  collapsible = FALSE,
  collapsed = FALSE,
  direction = "column",
  custom_controls = NULL
) {
  options <- list(
    title = title,
    position = position,
    collapsible = collapsible,
    collapsed = collapsed,
    direction = direction,
    customControls = custom_controls
  )

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addControlPanel",
      list(id = map$id, panelId = panel_id, options = options)
    )
  } else {
    # Store panel info for initial map creation
    if (is.null(map$x$controlPanels)) {
      map$x$controlPanels <- list()
    }
    map$x$controlPanels[[panel_id]] <- list(
      panelId = panel_id,
      options = options
    )
  }

  map
}

#' Add a control group to a control panel
#'
#' Creates a collapsible group within a control panel that can contain multiple controls.
#'
#' @param map           The map or map proxy object.
#' @param panel_id      ID of the target control panel.
#' @param group_id      Unique identifier for the control group.
#' @param group_title   Title for the control group (optional).
#' @param collapsible   Whether the group can be collapsed. Default is FALSE.
#' @param collapsed     Initial collapsed state. Default is FALSE.
#' @return              The map or map proxy object for chaining.
#' @export
add_control_group <- function(
  map,
  panel_id,
  group_id,
  group_title = NULL,
  collapsible = FALSE,
  collapsed = FALSE
) {
  group_config <- list(
    type = "group",
    groupId = group_id,
    groupTitle = group_title,
    collapsible = collapsible,
    collapsed = collapsed
  )

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addControlGroup",
      list(id = map$id, panelId = panel_id, groupConfig = group_config)
    )
  } else {
    # Store group for initial map creation
    if (is.null(map$x$controlPanels)) {
      map$x$controlPanels <- list()
    }

    # Initialize the panel if it doesn't exist
    if (is.null(map$x$controlPanels[[panel_id]])) {
      map$x$controlPanels[[panel_id]] <- list(
        panelId = panel_id,
        options = list(
          title = NULL,
          position = "bottom-left",
          collapsible = TRUE,
          collapsed = FALSE,
          customControls = list()
        )
      )
    }

    # Add the group to the panel's controls
    if (is.null(map$x$controlPanels[[panel_id]]$options$panelControls)) {
      map$x$controlPanels[[panel_id]]$options$panelControls <- list()
    }

    map$x$controlPanels[[panel_id]]$options$panelControls <-
      c(map$x$controlPanels[[panel_id]]$options$panelControls, list(group_config))
  }

  map
}

#' Add a control to an existing control panel
#'
#' @param map           The map or map proxy object.
#' @param panel_id      ID of the target control panel.
#' @param control_type  Type of control ("timeline", "speed", "custom").
#' @param control_options Control-specific options.
#' @param section_title Optional section title for the control.
#' @param group_id      Optional ID of the group to add the control to.
#' @return              The map or map proxy object for chaining.
#' @export
add_control_to_panel <- function(
  map,
  panel_id,
  control_type,
  control_options = list(),
  section_title = NULL,
  group_id = NULL
) {
  control_config <- list(
    type = control_type,
    options = control_options,
    title = section_title,
    groupId = group_id
  )

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addControlToPanel",
      list(id = map$id, panelId = panel_id, controlConfig = control_config)
    )
  } else {
    # Store control for initial map creation
    if (is.null(map$x$controlPanels)) {
      map$x$controlPanels <- list()
    }

    # Initialize the panel if it doesn't exist
    if (is.null(map$x$controlPanels[[panel_id]])) {
      map$x$controlPanels[[panel_id]] <- list(
        panelId = panel_id,
        options = list(
          title = NULL,
          position = "bottom-left",
          collapsible = TRUE,
          collapsed = FALSE,
          customControls = list()
        )
      )
    }

    # Add the control to the panel's customControls
    if (is.null(map$x$controlPanels[[panel_id]]$options$panelControls)) {
      map$x$controlPanels[[panel_id]]$options$panelControls <- list()
    }

    map$x$controlPanels[[panel_id]]$options$panelControls <-
      c(map$x$controlPanels[[panel_id]]$options$panelControls, list(control_config))
  }

  map
}

#' Add a timeline control to the map or control panel
#'
#' @param map           The map or map proxy object.
#' @param start_date    Start date for the timeline (YYYY-MM-DD format).
#' @param end_date      End date for the timeline (YYYY-MM-DD format).
#' @param position      Position on the map if not using a control panel. Default is "bottom-left".
#' @param max_ticks     Maximum number of labeled ticks to prevent overlap. Default is 3.
#' @param panel_id      ID of control panel to add to (optional).
#' @param section_title Section title when added to a control panel.
#' @return              The map or map proxy object for chaining.
#' @export
add_timeline_control <- function(
  map,
  start_date = NULL,
  end_date = NULL,
  position = "bottom-left",
  max_ticks = 3,
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
) {
  # Use default dates if not provided
  # if (is.null(start_date)) {
  #   start_date <- Sys.Date()
  # }
  # if (is.null(end_date)) {
  #   end_date <- Sys.Date() + 365
  # }

  options <- list(
    startDate = as.character(start_date),
    endDate = as.character(end_date),
    position = position,
    maxTicks = max_ticks,
    useControlPanel = !is.null(panel_id),
    panelId = panel_id,
    panelTitle = section_title,
    groupId = group_id
  )

  if (inherits(map, "mapProxy")) {
    if (!is.null(panel_id)) {
      # Add to control panel
      add_control_to_panel(map, panel_id, "timeline", options, section_title, group_id)
    } else {
      # Add as standalone control
      map$session$sendCustomMessage(
        "addTimelineControlStandalone",
        list(id = map$id, options = options)
      )
    }
  } else {
    # Store for initial map creation
    if (is.null(map$x$timelineControls)) {
      map$x$timelineControls <- list()
    }
    control_id <- if (!is.null(panel_id)) paste0(panel_id, "_timeline") else "standalone_timeline"
    map$x$timelineControls[[control_id]] <- options
  }

  map
}

#' Add a speed control to the map or control panel
#'
#' @param map           The map or map proxy object.
#' @param values        Vector of speed multiplier values. Default is c(0.5, 1, 2).
#' @param labels        Vector of labels for each speed value. Default is c("Slow", "Normal", "Fast").
#' @param default_index Index of the default speed (1-based). Default is 2.
#' @param position      Position on the map if not using a control panel. Default is "top-right".
#' @param panel_id      ID of control panel to add to (optional).
#' @param section_title Section title when added to a control panel.
#' @return              The map or map proxy object for chaining.
#' @export
add_speed_control <- function(
  map,
  values = c(0.5, 1, 2),
  labels = c("Slow", "Normal", "Fast"),
  default_index = 2,
  position = "top-right",
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
) {
  options <- list(
    values = values,
    labels = labels,
    defaultIndex = default_index - 1, # Convert to 0-based index for JS
    position = position,
    useControlPanel = !is.null(panel_id),
    panelId = panel_id,
    panelTitle = section_title,
    groupId = group_id
  )

  if (inherits(map, "mapProxy")) {
    if (!is.null(panel_id)) {
      # Add to control panel
      add_control_to_panel(map, panel_id, "speed", options, section_title, group_id)
    } else {
      # Add as standalone control
      map$session$sendCustomMessage(
        "addSpeedControlStandalone",
        list(id = map$id, options = options)
      )
    }
  } else {
    # Store for initial map creation
    if (is.null(map$x$speedControls)) {
      map$x$speedControls <- list()
    }
    control_id <- if (!is.null(panel_id)) paste0(panel_id, "_speed") else "standalone_speed"
    map$x$speedControls[[control_id]] <- options
  }

  map
}

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

#' Remove a control group from a control panel
#'
#' @param proxy       The map proxy object created by `mapProxy()`.
#' @param panel_id    The ID of the control panel.
#' @param group_id    The ID of the control group to remove.
#' @return            The map proxy object for chaining.
#' @export
remove_control_group <- function(proxy, panel_id, group_id) {
  proxy$session$sendCustomMessage(
    "removeControlGroup",
    list(
      id = proxy$id,
      panelId = panel_id,
      groupId = group_id
    )
  )
  proxy
}
