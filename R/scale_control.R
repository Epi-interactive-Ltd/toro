#' Add a scale control to the map
#'
#' Adds a distance scale bar to the map, wrapping MapLibre's native
#' `ScaleControl`.
#'
#' @param map The map or map proxy object.
#' @param id Unique identifier for the scale control. Default is `"scale_control"`.
#' @param max_width Maximum width, in pixels, of the scale control. Default is `80`.
#' @param unit Unit of measurement to display. One of `"metric"`, `"imperial"`,
#'   or `"nautical"`. Default is `"metric"`.
#' @param position Position of the control on the map. Default is `"bottom-left"`.
#' @return The map or map proxy object for chaining.
#' @export
#'
#' @examples
#' map() |>
#'   add_scale_control()
#'
#' map() |>
#'   add_scale_control(unit = "imperial", max_width = 100)
add_scale_control <- function(
  map,
  id = "scale_control",
  max_width = 100,
  unit = c("metric", "imperial", "nautical"),
  position = "bottom-left"
) {
  unit <- match.arg(unit)

  options <- list(
    id = id,
    maxWidth = max_width,
    unit = unit,
    position = position
  )

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addScaleControl",
      list(id = map$id, options = options)
    )
  } else {
    if (is.null(map$x$scaleControls)) {
      map$x$scaleControls <- list()
    }
    map$x$scaleControls[[id]] <- options
    map$x$controls <- c(map$x$controls, list(c(options, list(type = "scale"))))
  }
  map
}

#' Remove a scale control from the map
#'
#' @param proxy The map proxy object created by `mapProxy()`.
#' @param id Unique identifier of the scale control to remove.
#'   Default is `"scale_control"`.
#' @return The map proxy object for chaining.
#' @export
remove_scale_control <- function(proxy, id = "scale_control") {
  proxy$session$sendCustomMessage(
    "removeScaleControl",
    list(id = proxy$id, controlId = id)
  )
  proxy
}

#' Show or hide a scale control on the map
#'
#' @param proxy The map proxy object created by `mapProxy()`.
#' @param id Unique identifier of the scale control to toggle.
#'   Default is `"scale_control"`.
#' @param show Logical indicating whether to show or hide the control.
#'   Default is `TRUE`.
#' @return The map proxy object for chaining.
#' @export
#'
#' @examples
#' if (interactive()) {
#' library(shiny)
#' library(toro)
#'
#' ui <- fluidPage(
#'   tagList(
#'     mapOutput("map"),
#'     checkboxInput("show_scale", "Show scale control", value = TRUE)
#'   )
#' )
#' server <- function(input, output, session) {
#'   output$map <- renderMap({
#'     map() |> add_scale_control()
#'   })
#'
#'   observe({
#'     req(input$map_loaded)
#'     mapProxy("map") |>
#'       toggle_scale_control(show = input$show_scale)
#'   }) |>
#'     bindEvent(input$show_scale)
#' }
#' }
toggle_scale_control <- function(proxy, id = "scale_control", show = TRUE) {
  proxy$session$sendCustomMessage(
    "toggleScaleControl",
    list(id = proxy$id, controlId = id, show = show)
  )
  proxy
}


#' Update the unit of an existing scale control
#'
#' @param proxy The map proxy object created by `mapProxy()`.
#' @param id Unique identifier of the scale control to update.
#'   Default is `"scale_control"`.
#' @param unit Unit of measurement to display. One of `"metric"`, `"imperial"`,
#'   or `"nautical"`.
#' @return The map proxy object for chaining.
#' @export
set_scale_control_unit <- function(
  proxy,
  id = "scale_control",
  unit = c("metric", "imperial", "nautical")
) {
  unit <- match.arg(unit)
  proxy$session$sendCustomMessage(
    "setScaleControlUnit",
    list(id = proxy$id, controlId = id, unit = unit)
  )
  proxy
}
