#' Add Maplibre dependencies to a Shiny app
#'
#' Include this inside `tags$head` to add both the CSS and JS dependencies
#' for Maplibre.
#'
#' @returns A list of HTML tags to be included in the Shiny app's head.
#' @export
addMaplibreDependencies <- function() {
  shiny::tagList(
    # Maplibre CSS and JS dependencies
    shiny::tags$link(
      rel = "stylesheet",
      type = "text/css",
      href = "https://cdn.jsdelivr.net/npm/maplibre-gl@latest/dist/maplibre-gl.css"
    ),
    shiny::tags$script(src = "https://cdn.jsdelivr.net/npm/maplibre-gl@latest/dist/maplibre-gl.js"),
    # Draw control
    shiny::tags$script(
      src = "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.4.2/mapbox-gl-draw.js"
    ),
    shiny::tags$link(
      rel = "stylesheet",
      type = "text/css",
      href = "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.4.2/mapbox-gl-draw.css"
    )
  )
}
