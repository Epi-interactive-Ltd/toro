#' Add Mapbox dependencies to a Shiny app
#'
#' Include this inside `tags$head` to add both the CSS and JS dependencies
#' for Mapbox.
#'
#' @returns A list of HTML tags to be included in the Shiny app's head.
#' @export
addMapboxDependencies <- function() {
  shiny::tagList(
    # Mapbox CSS and JS dependencies
    shiny::tags$link(
      href = "https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css",
      rel = "stylesheet"
    ),
    shiny::tags$script(src = "https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.js"),
  )
}
