#' Add a paint control to the map
#'
#' Allow for a layer to change paint properties based on user input.
#'
#' @param map A toro map or mapProxy object.
#' @param id Unique identifier for the paint control.
#' @param layer_id The ID of the layer to control.
#' @param options_list A list of layer options to control
#'   (e.g., list(
#'     list(id = "default", label = "Default", paint = list('fill-color' = 'red')),
#'     list(id = "alternative", label = "Alternative", paint = list('fill-color' = 'blue'))
#'   )).
#' @param label Optional label for the control.
#' @param default Optional default value for the control.
#' @param position Position of the control on the map (e.g., "top-right").
#' @param input_type Type of input control. Either "select" for a dropdown or "radio" for radio
#'   buttons. Default is "select".
#' @return The modified map object.
#' @export
#' @example inst/examples/paint-control.R
add_paint_control <- function(
  map,
  id,
  layer_id,
  options_list,
  label = NULL,
  default = NULL,
  position = "top-right",
  input_type = "select"
) {
  options <- list(
    id = id,
    layerId = layer_id,
    optionsList = options_list,
    label = label,
    default = default,
    position = position,
    inputType = input_type
  )

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addPaintControl",
      list(id = map$id, options = options)
    )
  } else {
    # Store for initial map creation
    if (is.null(map$x$paintControls)) {
      map$x$paintControls <- list()
    }
    map$x$paintControls[[id]] <- options
  }
  map
}

#' Remove a paint control from the map
#'
#' @param map A toro map or mapProxy object.
#' @param id Unique identifier for the paint control to remove.
#' @return The modified map object.
#' @export
#' @example inst/examples/paint-control.R
remove_paint_control <- function(map, id) {
  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "removePaintControl",
      list(id = map$id, controlId = id)
    )
  } else {
    if (!is.null(map$x$paintControls[[id]])) {
      map$x$paintControls[[id]] <- NULL
    }
  }
  map
}
