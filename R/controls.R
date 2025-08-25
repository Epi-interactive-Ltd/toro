#' Utilities for the map related to controls.
#'
#' Functions:
#' - `toggle_control`:            Toggle the visibility of a control on the map.
#' - `add_cursor_coords_control`: Add a cursor coordinates control to the map.
#' - `add_draw_control`:          Add a draw control to the map.
#' - `add_zoom_control`:          Add a zoom control to the map.
#' - `add_custom_control`:        Add a custom HTML control to the map.
#' - `delete_drawn_shape`:        Delete a drawn shape from the map.

#' Toggle the visibility of a control on the map.
#'
#' @param proxy       The map proxy object created by `mapProxy()`.
#' @param control_id  The ID of the control to toggle.
#' @param show        Logical indicating whether to show or hide the control. Default is `TRUE`.
#' @return            The map proxy object for chaining.
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
  controls <- list(position = position, longLabel = long_label, latLabel = lat_label)
  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage("addCursorCoordsControl", list(id = map$id, controls))
  }

  if (is.null(map$x$cursorControls)) {
    map$x$cursorControls <- controls
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
    map$x$zoomControl <- list(position = position, controlOptions = control_options)
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
add_custom_control <- function(map, id, html, position = "top-right") {
  options <- list(controlId = id, html = html, position = position)

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addCustomControl",
      list(id = map$id, options = options)
    )
  }

  map$x$customControls <- c(map$x$customControls, list(options))
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
  options <- list(
    position = position,
    modes = list(modes),
    activeColour = active_colour,
    inactiveColour = inactive_colour,
    modeLabels = mode_labels
  )

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addDraw",
      list(id = map$id, options = options)
    )
  }

  if (is.null(map$x$drawControl)) {
    map$x$drawControl <- options
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
