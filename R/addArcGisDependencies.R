#' Add ArcGis dependencies to a Shiny app
#'
#' Include this inside `tags$head` to add both the CSS and JS dependencies
#' for ArcGis.
#'
#' @returns A list of HTML tags to be included in the Shiny app's head.
#' @export
addArcGisDependencies <- function() {
  shiny::tagList(
    # ArcGIS JS dependencies
    shiny::tags$script(
      type = "module",
      src = "https://js.arcgis.com/calcite-components/3.0.3/calcite.esm.js"
    ),
    shiny::tags$link(
      rel = "stylesheet",
      href = "https://js.arcgis.com/4.32/esri/themes/dark/main.css"
    ),
    shiny::tags$script(src = "https://js.arcgis.com/4.32/"),
    shiny::tags$script(
      type = "module",
      src = "https://js.arcgis.com/map-components/4.32/arcgis-map-components.esm.js"
    ),

    # This needs to be last?
    shiny::HTML(
      "<style>
        html,
        body {
          padding: 0;
          margin: 0;
          height: 100%;
          width: 100%;
        }
        arcgis-map {
        display: block;
        height: 50vh;
      }
      </style>"
    )
  )
}
