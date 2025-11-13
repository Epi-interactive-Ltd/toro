#' Add a route to a toro map.
#'
#' @param map       A toro map object or a map proxy object.
#' @param route_id  A unique identifier for the route.
#' @param points    A sf object containing the points of the route.
#' @param settings  A list of settings for the route (e.g., color, weight).
#' @return          The updated map object.
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

#' Play a route animation on a toro map.
#'
#' @param map       A toro map object or a map proxy object.
#' @param route_id  A unique identifier for the route.
#' @param settings  A list of settings for the animation (e.g., speed, loop).
#' @return          The updated map object.
#' @export
play_route <- function(map, route_id, settings = list()) {
  options <- list(routeId = route_id, options = settings)

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "animateRoute",
      list(id = map$id, options = options)
    )
  }
  # TODO: Add to initial map ?
  # map$x$setBounds <- options
  map
}

#' Pause a route animation on a toro map.
#'
#' @param map       A toro map object or a map proxy object.
#' @param route_id  A unique identifier for the route.
#' @param settings  A list of settings for pausing the animation.
#' @return          The updated map object.
#' @export
pause_route <- function(map, route_id, settings = list()) {
  options <- list(routeId = route_id, options = settings)

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "pauseRoute",
      list(id = map$id, options = options)
    )
  }
  # TODO: Add to initial map ?
  # map$x$setBounds <- options
  map
}

#' Remove an animation route from a toro map.
#'
#' @param map       A toro map object or a map proxy object.
#' @param route_id  A unique identifier for the route.
#' @param settings  A list of settings for removing the route.
#' @return          The updated map object.
#' @export
remove_route <- function(map, route_id, settings = list()) {
  options <- list(routeId = route_id, options = settings)

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "removeRoute",
      list(id = map$id, options = options)
    )
  }
  # TODO: Add to initial map ?
  # map$x$setBounds <- options
  map
}
