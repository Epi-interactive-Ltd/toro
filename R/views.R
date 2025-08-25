#' Utilites for the map related to the view.
#'
#' Functions:
#' - `set_zoom`: Set the map zoom level.
#' - `set_bounds`: Set the map bounds.

#' Set the map zoom level.
#'
#' @param map   The map or map proxy object.
#' @param zoom  The zoom level to set. Default is 2.
#' @return      The map or map proxy object for chaining.
#' @export
set_zoom <- function(map, zoom) {
  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage("setMapZoom", list(id = map$id, zoom = zoom))
  }
  if (is.null(map$x$setZoom)) {
    map$x$setZoom <- zoom
  }
  map
}

#' Set the map bounds.
#'
#' @param map     The map or map proxy object.
#' @param bounds  A list of two lists, each containing longitude and latitude pairs.
#'                For example: `list(list(-79, 43), list(-73, 45))`.
#' @param padding The padding around the bounds in pixels. Default is 50.
#' @param maxZoom The maximum zoom level to set. Default is the object's `maxZoom`.
#' @return        The map or map proxy object for chaining.
#' @export
set_bounds <- function(map, bounds, padding = 50, maxZoom = map$maxZoom) {
  options <- list(bounds = bounds, padding = padding, maxZoom = maxZoom)
  # For JS need to be: [[-79, 43], [-73, 45]]
  # We use lists to achieve this: list(list(-79, 43), list(-73, 45))

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "setMapBounds",
      list(id = map$id, options = options)
    )
  }
  map$x$setBounds <- options
  map
}
