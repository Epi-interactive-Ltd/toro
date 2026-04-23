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

  options <- list(
    routeId = route_id,
    points = points_geojson,
    options = settings
  )

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addRoute",
      list(id = map$id, options = options)
    )
  } else {
    map$x$routes <- c(map$x$routes, list(options))
  }
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

#' Add animation controls to a toro map.
#'
#' Adds play/pause/stop buttons to control route animations on the map.
#' Optionally includes a speed control slider for adjusting animation speed.
#'
#' @param map                   A toro map object or a map proxy object.
#' @param route_id              Optional route ID to control. If NULL, controls all routes.
#' @param position              Position of the controls on the map. Default is "top-right".
#' @param panel_id              Optional control panel ID to add controls to instead of map.
#' @param buttons               Character vector of buttons to include.
#'                              Options: "play", "pause", "stop". Default is c("play", "pause").
#' @param include_speed_control Logical. Whether to include a speed control slider. Default is FALSE.
#' @param speed_values          Numeric vector of speed values for the speed slider.
#'                              Default is c(0.5, 1, 2) for slow, normal, and fast speeds.
#' @param speed_labels          Character vector of labels for speed values.
#'                              Default is c("Slow", "Normal", "Fast").
#' @param settings              A list of additional settings for the controls.
#' @return                      The updated map object.
#' @export
add_animation_controls <- function(
  map,
  route_id = NULL,
  position = "top-right",
  panel_id = NULL,
  buttons = c("play", "pause"),
  include_speed_control = FALSE,
  speed_values = c(0.5, 1, 2),
  speed_labels = c("Slow", "Normal", "Fast"),
  settings = list()
) {
  # Validate button options
  valid_buttons <- c("play", "pause", "stop")
  buttons <- intersect(buttons, valid_buttons)

  if (length(buttons) == 0) {
    stop(
      "At least one valid button must be specified: ",
      paste(valid_buttons, collapse = ", ")
    )
  }

  # Validate speed control options
  if (include_speed_control) {
    if (length(speed_values) != length(speed_labels)) {
      stop("speed_values and speed_labels must have the same length")
    }
    if (length(speed_values) < 2) {
      stop("At least 2 speed values must be provided for meaningful control")
    }
  }

  options <- list(
    type = "animation",
    routeId = route_id,
    position = position,
    panelId = panel_id,
    buttons = buttons,
    includeSpeedControl = include_speed_control,
    speedValues = speed_values,
    speedLabels = speed_labels,
    settings = settings
  )

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addAnimationControls",
      list(id = map$id, options = options)
    )
  } else {
    # For initial map creation, store in map object
    if (is.null(map$x$animationControls)) {
      map$x$animationControls <- list()
    }
    map$x$animationControls <- append(map$x$animationControls, list(options))
    map$x$controls <- c(map$x$controls, list(options))
  }

  map
}
