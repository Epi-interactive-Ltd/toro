#' Utilities for the map related to map sources.

#' Add a source to the map.
#'
#' @note If you add a source directly in an add layer function, the source ID will
#' be automatically generated as "source-[layer-id]".
#'
#' @param map The map or map proxy object.
#' @param source_id The ID for the source.
#' @param data The data for the source, typically in GeoJSON format.
#' @param type The type of the source. Default is `"geojson"`.
#'    Other options include `"vector"` or `"raster"`.
#' @param cluster Whether to enable clustering for this source. Default is `FALSE`.
#' @return The map or map proxy object for chaining.
#' @export
#'
#' @examples
#' \dontrun{
#'  map() |>
#'    add_source(
#'      source_id = "my_source",
#'      data = sf::st_as_sf(quakes, coords = c("long", "lat"), crs = 4326)
#'    ) |>
#'    add_circle_layer(id = "quakes", source = "my_source")
#' }
add_source <- function(
  map,
  source_id,
  data,
  type = "geojson",
  cluster = FALSE,
  ...
) {
  if (type == "geojson" && !"geojson" %in% class(data)) {
    data <- geojsonsf::sf_geojson(data)
  }
  source_options <- list(
    type = type,
    data = data,
    cluster = cluster
  )

  # Add any additional arguments from ...
  extra_args <- list(...)

  # Allow for both `source_id` and `id` to be used for backward compatibility
  src_id <- source_id
  if (is.null(src_id) && !is.null(extra_args$id)) {
    src_id <- extra_args$id
    extra_args$id <- NULL # Remove 'id' from extra_args to avoid confusion
  }
  if (length(extra_args) > 0) {
    source_options <- c(source_options, extra_args)
  }

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addMapSource",
      list(id = map$id, sourceId = src_id, sourceOptions = source_options)
    )
  }
  map$x$sources <- c(
    map$x$sources,
    list(list(sourceId = src_id, sourceOptions = source_options))
  )
  map
}


#' Add a FeatureService source to the map.
#'
#' @note By default the function appends a query URL to the provided `source_url` to retrieve all
#'    features in GeoJSON format. If you need more control over the query parameters, you can
#'    provide the full query URL directly in the `source_url` argument and set `append_query_url`
#'    to an empty string to prevent appending the default query parameters.
#'
#' @param map The map or map proxy object.
#' @param source_url The URL of the FeatureService source.
#' @param source_id The ID for the source.
#' @param append_query_url The query URL to append to the source URL. Default is
#'    `"/0/query?where=1=1&outFields=*&f=geojson"`.
#' @return The map or map proxy object for chaining.
#' @export
#'
#' @examples
#' \dontrun{
#'  map() |>
#'    add_feature_server_source(
#'      "https://services1.arcgis.com/VwarAUbcaX64Jhub/arcgis/rest/services/World_Exclusive_Economic_Zones_Boundaries/FeatureServer",
#'      "eez"
#'    ) |>
#'    add_line_layer(id = "eez_lines", source = "eez")
#' }
add_feature_server_source <- function(
  map,
  source_url,
  source_id,
  append_query_url = "/0/query?where=1=1&outFields=*&f=geojson"
) {
  source_options <- list(
    type = "geojson",
    data = paste0(source_url, append_query_url)
  )
  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addMapSource",
      list(
        id = map$id,
        sourceOptions = source_options,
        sourceId = source_id
      )
    )
  }
  map$x$sources <- c(
    map$x$sources,
    list(list(sourceId = source_id, sourceOptions = source_options))
  )
  map
}

#' Add an Image Server source to a toro map
#' TODO: WIP
#'
#' @param map A toro map object or a map proxy object.
#' @param url The URL of the ArcGIS Image Server.
#' @param source_id A unique identifier for the source.
#' @param ... Additional parameters for the Image Server source.
#' @return The updated map object.
#' @keywords internal
add_tiles_from_map_server <- function(
  map,
  url,
  tile_id,
  as_image_layer = FALSE,
  ...
) {
  source_options <- list(
    tileId = tile_id,
    tiles = paste0(url, "/tile/{z}/{y}/{x}"),
    ...
  )

  # if (inherits(map, "mapProxy")) {
  #   map$session$sendCustomMessage(
  #     "addTilesFromMapServer",
  #     list(
  #       id = map$id,
  #       sourceOptions = source_options,
  #       sourceId = tile_id
  #     )
  #   )
  # }
  key <- ifelse(as_image_layer, "imageLayerTiles", "mapServerTiles")
  map$x[[key]] <- c(
    map$x[[key]],
    list(list(tileId = tile_id, mapServiceUrl = url, options = ...))
  )
  map
}

#' Add an Image Server source to a toro map
#' TODO: WIP
#'
#' @param map A toro map object or a map proxy object.
#' @param url The URL of the ArcGIS Image Server.
#' @param source_id A unique identifier for the source.
#' @param ... Additional parameters for the Image Server source.
#' @return The updated map object.
#' @keywords internal
add_tiles_from_wms <- function(map, url, tile_id, as_image_layer = FALSE, ...) {
  source_options <- list(
    tileId = tile_id,
    tiles = url,
    # tiles = paste0(
    #   url,
    #   "?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256"
    # ),
    ...
  )

  # if (inherits(map, "mapProxy")) {
  #   map$session$sendCustomMessage(
  #     "addTilesFromMapServer",
  #     list(
  #       id = map$id,
  #       sourceOptions = source_options,
  #       sourceId = tile_id
  #     )
  #   )
  # }
  key <- ifelse(as_image_layer, "imageLayerTiles", "mapServerTiles")
  map$x[[key]] <- c(
    map$x[[key]],
    list(list(tileId = tile_id, mapServiceUrl = url, options = ...))
  )
  map
}

#' Add an image source to the map.
#'
#' @param map The map or map proxy object.
#' @param image_id The ID of the image source.
#' @param image_url The URL of the image to add.
#' @return The map or map proxy object for chaining.
#' @export
#'
#' @examples
#' \dontrun{
#'  map() |>
#'    add_image(
#'      image_id = "leaf-icon",
#'      image_url = "https://upload.wikimedia.org/wikipedia/en/thumb/0/02/Leaf_icon.png/600px-Leaf_icon.png"
#'    ) |>
#'    add_symbol_layer(
#'      id = "leaf_symbols",
#'      source = sf::st_as_sf(quakes, coords = c("long", "lat"), crs = 4326),
#'      layout = toro::get_layout_options(
#'        "symbol",
#'        options = list(
#'          icon_image = "leaf-icon",
#'          icon_size = 0.1
#'        )
#'      )
#'    )
#' }
add_image <- function(map, image_id, image_url) {
  # Convert local file paths to data URIs for compatibility
  processed_url <- image_url
  if (is_local_file(image_url)) {
    # Check if base64enc package is available
    if (!requireNamespace("base64enc", quietly = TRUE)) {
      stop(
        "The 'base64enc' package is required to use local image files. Please install it with: install.packages('base64enc')"
      )
    }
    processed_url <- image_to_data_uri(image_url)
  }

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addImageSource",
      list(
        id = map$id,
        imageId = image_id,
        imageUrl = processed_url
      )
    )
  }
  map$x$imageSources <- c(
    map$x$imageSources,
    list(list(imageId = image_id, imageUrl = processed_url))
  )
  map
}


#' Set data for a source on the map.
#'
#' @param proxy The map proxy object created by `mapProxy()`.
#' @param source_id The ID of the source to update.
#' @param data The data for the source, typically in GeoJSON format.
#' @param type The type of the source. Default is `"geojson"`. Other options include `"vector"` or `"raster"`.
#' @return The map proxy object for chaining.
#' @export
#'
#' @examples
#' \dontrun{
#' library(shiny)
#' library(sf)
#' library(toro)
#'
#' data(quakes)
#' quakes_data <- st_as_sf(quakes, coords = c("long", "lat"), crs = 4326)
#'
#' ui <- fluidPage(
#'  tagList(
#'    mapOutput("map"),
#'    actionButton("btn", "Update Source Data")
#'  )
#' )
#' server <- function(input, output, session) {
#'  get_random_points <- function(data, n = 10) {
#'    random_rows <- runif(n, min = 1, max = nrow(data))
#'    return(data[random_rows, ])
#'  }
#'
#'  output$map <- renderMap({
#'    map() |>
#'      add_symbol_layer(
#'        id = "quakes",
#'        source = get_random_points(quakes_data)
#'      )
#'    })
#'  observe({
#'    mapProxy("map") |>
#'      set_source_data(
#'        source_id = "source-quakes",
#'        data = get_random_points(quakes_data)
#'      )
#'  }) |>
#'  bindEvent(input$btn)
#' }
#' }
set_source_data <- function(proxy, source_id, data, type = "geojson") {
  if (type == "geojson" && !"geojson" %in% class(data)) {
    data <- geojsonsf::sf_geojson(data)
  }
  proxy$session$sendCustomMessage(
    "updateSourceData",
    list(
      id = proxy$id,
      sourceId = source_id,
      data = data
    )
  )
  proxy
}
