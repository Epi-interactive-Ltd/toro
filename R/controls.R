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
#' @return            The map or map proxy object for chaining.
#' @export
add_cursor_coords_control <- function(
  map,
  position = "bottom-left",
  long_label = "Lng",
  lat_label = "Lat"
) {
  control <- list(
    type = "cursor",
    position = position,
    longLabel = long_label,
    latLabel = lat_label
  )
  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage("addCursorCoordsControl", list(id = map$id, control))
  }

  if (is.null(map$x$cursorControls)) {
    map$x$cursorControls <- control
    map$x$controls <- c(map$x$controls, list(control))
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
#' @return                The map proxy object for chaining.
#' @export
add_zoom_control <- function(map, position = "top-right", control_options = list()) {
  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addZoomControl",
      list(
        id = map$id,
        position = position,
        controlOptions = control_options
      )
    )
  }

  if (is.null(map$x$zoomControl)) {
    control <- list(type = "zoom", position = position, controlOptions = control_options)
    map$x$zoomControl <- control
    map$x$controls <- c(map$x$controls, list(control))
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
#' @return            The map or map proxy object for chaining.
#' @export
add_custom_control <- function(map, id, html, panel_id = NULL, position = "top-right") {
  control <- list(type = "custom", controlId = id, html = html, position = position)

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addCustomControl",
      list(id = map$id, options = control)
    )
  }

  map$x$customControls <- c(map$x$customControls, list(control))
  map$x$controls <- c(map$x$controls, list(control))
  map
}


#' Add a draw control to the map
#'
#' @param map           The map or map proxy object.
#' @param position        The position of the draw control on the map. Default is `"top-right"`.
#'                        Options are "top-left", "top-right", "bottom-left", "bottom-right".
#' @param modes           A vector of modes to enable in the draw control.
#'                        Default is `c("polygon", "trash")`.
#'                        Options include "polygon", "trash", "line".
#' @param active_colour   The colour for the drawn shapes. Default is `"#0FB3CE"`.
#' @param inactive_colour The colour for the inactive shapes. Default is `"#0FB3CE"`.
#' @param mode_labels     A named list of labels for each mode.
#'                        For example, `list(polygon = "Draw Polygon", trash = "Delete Shape")`.
#' @return                The map or map proxy object for chaining.
#' @export
add_draw_control <- function(
  map,
  id = "draw_control",
  position = "top-right",
  modes = c("polygon", "trash"),
  active_colour = "#0FB3CE",
  inactive_colour = "#0FB3CE",
  mode_labels = list()
) {
  control <- list(
    type = "draw",
    position = position,
    modes = list(modes),
    activeColour = active_colour,
    inactiveColour = inactive_colour,
    modeLabels = mode_labels
  )

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addDraw",
      list(id = map$id, options = control)
    )
  }

  if (is.null(map$x$drawControl)) {
    map$x$drawControl <- options
    map$x$controls <- c(map$x$controls, list(control))
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

#' Remove the draw control from the map.
#'
#' @param proxy  The map proxy object created by `mapProxy()`.
#' @return       The map proxy object for chaining.
#' @export
remove_draw_control <- function(proxy) {
  remove_control(proxy, "toro_draw_control")
}

#' Remove the zoom control from the map.
#'
#' @param proxy  The map proxy object created by `mapProxy()`.
#' @return       The map proxy object for chaining.
#' @export
remove_zoom_control <- function(proxy) {
  remove_control(proxy, "toro_zoom_control")
}

#' Remove the cursor coordinates control from the map.
#'
#' @param proxy  The map proxy object created by `mapProxy()`.
#' @return       The map proxy object for chaining.
#' @export
remove_cursor_coords_control <- function(proxy) {
  remove_control(proxy, "toro_cursor_coords_control")
}

#' Remove the timeline control from the map.
#'
#' @param proxy  The map proxy object created by `mapProxy()`.
#' @return       The map proxy object for chaining.
#' @export
remove_timeline_control <- function(proxy) {
  remove_control(proxy, "toro_timeline_control")
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
#' @param collapsible   Whether the panel can be collapsed. Default is TRUE.
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
  collapsible = TRUE,
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

#' Add a control to an existing control panel
#'
#' @param map           The map or map proxy object.
#' @param panel_id      ID of the target control panel.
#' @param control_type  Type of control ("timeline", "speed", "custom").
#' @param control_options Control-specific options.
#' @param section_title Optional section title for the control.
#' @return              The map or map proxy object for chaining.
#' @export
add_control_to_panel <- function(
  map,
  panel_id,
  control_type,
  control_options = list(),
  section_title = NULL
) {
  control_config <- list(
    type = control_type,
    options = control_options,
    title = section_title
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
  section_title = NULL
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
    panelTitle = section_title
  )

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addTimelineControlStandalone",
      list(id = map$id, options = options)
    )
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
  section_title = NULL
) {
  options <- list(
    values = values,
    labels = labels,
    defaultIndex = default_index - 1, # Convert to 0-based index for JS
    position = position,
    useControlPanel = !is.null(panel_id),
    panelId = panel_id,
    panelTitle = section_title
  )

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addSpeedControlStandalone",
      list(id = map$id, options = options)
    )
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
  section_title = NULL
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
    panelTitle = section_title
  )

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addTileSelectorControlStandalone",
      list(id = map$id, options = options)
    )
  } else {
    # Store for initial map creation
    if (is.null(map$x$tileSelectorControls)) {
      map$x$tileSelectorControls <- list()
    }
    control_id <- if (!is.null(panel_id)) {
      paste0(panel_id, "_tile_selector")
    } else {
      "standalone_tile_selector"
    }
    map$x$tileSelectorControls[[control_id]] <- options
  }

  map
}
