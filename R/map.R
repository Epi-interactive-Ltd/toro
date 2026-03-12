#' Create a Maplibre map widget.
#'
#' This function creates a map htmlwidget for use in R and Shiny applications.
#'
#' @param style The style of the map. Default is "lightgrey".
#' @param center The initial center of the map as a longitude/latitude pair.
#'  Default is c(174, -41).
#' @param zoom The initial zoom level of the map. Default is 2.
#' @param width The width of the widget. Optional.
#' @param height The height of the widget. Optional.
#' @param session The Shiny session object. Default is the current session.
#' @param ... Additional options to customize the map.
#'  \itemize{
#'    \item minZoom: Minimum zoom level (0-24). Default is 2.
#'    \item maxZoom: Maximum zoom level (0-24). Default is 18.
#'    \item clusterColour: The colour of the cluster circles. Default is "#808080".
#'    \item loadedTiles: A character vector of tile ids to load, or a named list of tile options.
#'      Full options: c("natgeo", "satellite", "topo", "terrain", "streets", "shaded", "lightgrey").
#'      Default is c("lightgrey", "satellite").
#'    \item initialTileLayer: The tile layer to use when the map is first loaded.
#'      Default is NULL (the first layer in loadedTiles).
#'    \item backgroundColour: The background colour of the map. Default is "#D0CFD4".
#'    \item enable3D: Whether to enable 3D dragging/view. Default is FALSE.
#'    \item initialLoadedLayers: A character vector of layer ids that should be loaded before the
#'      initial map spinner is hidden. Default is NULL.
#'    \item spinnerWhileBusy: Whether to show a spinner while the map is busy (e.g. loading tiles).
#'      Default is FALSE.
#'    \item busyLoaderBgColour: The background colour of the busy loader.
#'      Default is "rgba(0, 0, 0, 0.2)".
#'    \item busyLoaderColour: The colour of the busy loader. Default is "white".
#'    \item initialLoaderBgColour: The background colour of the initial loader. Default is "white".
#'    \item initialLoaderColour: The colour of the initial loader. Default is "black".
#'    \item clusterOptions: A list of options for clustering, if `can_cluster` is `TRUE`.
#'      See the [cluster vignette](https://epi-interactive-ltd.github.io/toro/articles/layers.html)
#'      for details on available options.
#'    \item attributionPosition: The position of the attribution control. Default is "bottom-right".
#'  }
#' @return An object of class \code{htmlwidget} representing the map.
#'
#' @import htmlwidgets
#'
#' @examples
#' if (interactive()) {
#' map()
#'
#' map(loadedTiles = c("natgeo", "streets"))
#'
#' # Add maxzoom to satellite layer
#' map(loadedTiles = list(natgeo = list(), satellite = list(maxZoom = 2)))
#' }
#' @export
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
  map_options <- modifyList(default_options, user_options)

  # If the style is not in loadedTiles, add it
  if (class(map_options$loadedTiles) == "list") {
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
      options = map_options
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

#' Shiny bindings for map
#'
#' Output and render functions for using map within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a map
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name map-shiny
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

#' @name map-shiny
#' @export
renderMap <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) {
    expr <- substitute(expr)
  } # force quoted
  htmlwidgets::shinyRenderWidget(expr, mapOutput, env, quoted = TRUE)
}

#' Create a proxy object for updating the map.
#'
#' @param outputId  The ID of the output element.
#' @param session   The Shiny session object (default is the current session).
#' @return          A proxy object for the map.
#' @export
mapProxy <- function(outputId, session = shiny::getDefaultReactiveDomain()) {
  structure(list(id = outputId, session = session), class = "mapProxy")
}
