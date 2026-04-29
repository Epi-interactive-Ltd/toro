#' Create a MapLibre map widget
#'
#' This function creates a map htmlwidget for use in R and Shiny applications.
#'
#' @param style The style of the map. Default is "lightgrey"
#' @param center The initial center of the map as a longitude/latitude pair.
#'  Default is c(174, -41)
#' @param zoom The initial zoom level of the map. Default is 2
#' @param width The width of the widget. Optional
#' @param height The height of the widget. Optional
#' @param session The Shiny session object. Default is the current session
#' @param ... Additional options to customize the map.
#'  \itemize{
#'    \item minZoom: Minimum zoom level (0-24). Default is 2
#'    \item maxZoom: Maximum zoom level (0-24). Default is 18
#'    \item clusterColour: The colour of the cluster circles. Default is "#808080"
#'    \item loadedTiles: A character vector of tile ids to load, or a named list of tile options.
#'      Full options: c("natgeo", "satellite", "topo", "terrain", "streets", "shaded", "lightgrey").
#'      Default is c("lightgrey", "satellite")
#'    \item initialTileLayer: The tile layer to use when the map is first loaded.
#'      Default is NULL (the first layer in loadedTiles)
#'    \item backgroundColour: The background colour of the map. Default is "#D0CFD4"
#'    \item enable3D: Whether to enable 3D dragging/view. Default is FALSE
#'    \item initialLoadedLayers: A character vector of layer ids that should be loaded before the
#'      initial map spinner is hidden. Default is NULL
#'    \item spinnerWhileBusy: Whether to show a spinner while the map is busy (e.g. loading tiles).
#'      Default is FALSE
#'    \item busyLoaderBgColour: The background colour of the busy loader.
#'      Default is "rgba(0, 0, 0, 0.2)"
#'    \item busyLoaderColour: The colour of the busy loader. Default is "white"
#'    \item initialLoaderBgColour: The background colour of the initial loader. Default is "white"
#'    \item initialLoaderColour: The colour of the initial loader. Default is "black"
#'    \item clusterOptions: A list of options for clustering, if `can_cluster` is `TRUE`.
#'      See the [cluster vignette](https://epi-interactive-ltd.github.io/toro/articles/layers.html)
#'      for details on available options
#'    \item attributionPosition: The position of the attribution control. Default is "bottom-right"
#'  }
#' @return An object of class \code{htmlwidget} representing the map
#' @export
#'
#' @import htmlwidgets
#'
#' @examples
#' \dontrun{
#' map()
#'
#' map(loadedTiles = c("natgeo", "streets"))
#'
#' # Add maxzoom to satellite layer
#' map(loadedTiles = list(natgeo = list(), satellite = list(maxZoom = 2)))
#' }
map <- function(
  style = "lightgrey",
  center = c(174, -41),
  zoom = 2,
  width = "100%",
  height = NULL,
  session = shiny::getDefaultReactiveDomain(),
  ...
) {
  default_options <- list(
    minZoom = 2, # 0-24
    maxZoom = 18, # 0-24
    clusterColour = "#808080",
    # Full options: c("natgeo", "satellite", "topo", "terrain", "streets", "shaded", "lightgrey")
    loadedTiles = c("lightgrey", "satellite"),
    initialTileLayer = NULL,
    backgroundColour = "#D0CFD4",
    enable3D = FALSE,
    initialLoadedLayers = NULL,
    spinnerWhileBusy = FALSE,
    busyLoaderBgColour = "rgba(0, 0, 0, 0.2)",
    busyLoaderColour = "white",
    initialLoaderBgColour = "white",
    initialLoaderColour = "black"
  )
  user_options <- list(...)
  map_options <- utils::modifyList(default_options, user_options)

  # Process imageSources to convert local file paths to data URIs
  if (!is.null(user_options$imageSources)) {
    processed_image_sources <- lapply(
      user_options$imageSources,
      function(image_source) {
        image_id <- image_source$id %||% image_source$image_id
        image_url <- image_source$url %||% image_source$image_url
        if (!is.null(image_url) && is_local_file(image_url)) {
          # Check if base64enc package is available
          if (!requireNamespace("base64enc", quietly = TRUE)) {
            stop(
              "The 'base64enc' package is required to use local image files. Please install it with: install.packages('base64enc')"
            )
          }
          image_url <- image_to_data_uri(image_url)
        }
        return(list(
          url = image_url,
          id = image_id
        ))
      }
    )
    map_options$imageSources <- processed_image_sources
  }

  # If the style is not in loadedTiles, add it
  if (is.list(map_options$loadedTiles)) {
    if (!style %in% names(map_options$loadedTiles)) {
      map_options$loadedTiles[[style]] <- list()
    }
  } else {
    if (!style %in% map_options$loadedTiles) {
      map_options$loadedTiles <- c(map_options$loadedTiles, style)
    }
  }

  htmlwidgets::createWidget(
    name = "map",
    x = list(
      style = style,
      center = center,
      zoom = zoom,
      options = map_options,
      imageSources = map_options$imageSources
    ),
    width = width,
    height = height,
    package = "toro",
    sizingPolicy = htmlwidgets::sizingPolicy(
      viewer.suppress = FALSE,
      browser.fill = TRUE,
      viewer.fill = TRUE,
      knitr.figure = TRUE,
      padding = 0,
      knitr.defaultHeight = "500px",
      viewer.defaultHeight = "100vh",
      browser.defaultHeight = "100vh"
    )
  )
}

#' Create a MapLibre GL output for use in Shiny
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended
#' @return A MapLibre GL map for use in a Shiny UI
#'
#' @export
mapOutput <- function(outputId, width = "100%", height = "600px") {
  htmlwidgets::shinyWidgetOutput(
    outputId,
    "map",
    width,
    height,
    package = "toro"
  )
}

#' Render a MapLibre GL map in Shiny
#'
#' @param expr An expression that generates a map
#' @param env The environment in which to evaluate \code{expr}
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable
#' @return A rendered MapLibre GL map for use in a Shiny server
#' @export
renderMap <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) {
    expr <- substitute(expr)
  } # force quoted
  htmlwidgets::shinyRenderWidget(expr, mapOutput, env, quoted = TRUE)
}

#' Create a proxy object for updating the map
#'
#' @param outputId The ID of the output element
#' @param session The Shiny session object (default is the current session)
#' @return A proxy object for the map
#' @export
#'
#' @examples
#' \dontrun{
#' library(shiny)
#' library(toro)
#'
#' ui <- fluidPage(
#'  tagList(
#'    mapOutput("map"),
#'    checkboxInput("has_zoom_controls", "Remove Zoom Controls", value = TRUE)
#'  )
#' )
#' server <- function(input, output, session) {
#'  output$map <- renderMap({
#'    map() |>
#'      add_zoom_control()
#'  })
#'
#'  observe({
#'    req(input$map_loaded)
#'    if (input$has_zoom_controls == TRUE) {
#'      mapProxy("map") |>
#'        add_zoom_control()
#'    } else {
#'      mapProxy("map") |>
#'        remove_zoom_control()
#'    }
#'  }) |>
#'    bindEvent(input$has_zoom_controls)
#' }
#' }
mapProxy <- function(outputId, session = shiny::getDefaultReactiveDomain()) {
  structure(list(id = outputId, session = session), class = "mapProxy")
}
