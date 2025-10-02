#' Add a route to a toro map.
#'
#' @param map A toro map object or a map proxy object.
#' @param route_id A unique identifier for the route.
#' @param points A sf object containing the points of the route.
#' @param settings A list of settings for the route (e.g., color, weight).
#' @return The updated map object.
#' @export
add_route <- function(map, route_id, points, settings = list()) {
  points_geojson <- geojsonsf::sf_geojson(points)

  options <- list(routeId = route_id, points = points_geojson, options = settings)

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addRoute",
      list(id = map$id, options = options)
    )
  }
  # TODO: Add to initial map ?
  # map$x$setBounds <- options
  map
}
