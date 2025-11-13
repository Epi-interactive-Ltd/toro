#' Utilities for the map related to map sources.
#'
#' Functions:
#' - `add_source`: Add a source to the map.
#' - `add_feature_server_source`: Add a FeatureServer source to the map.
#' - `add_image`: Add an image source to the map.
#' - `set_source_data`: Set data for a source on the map.

#' Add a source to the map.
#'
#' @param map       The map or map proxy object.
#' @param source_id The ID for the source.
#' @param data      The data for the source, typically in GeoJSON format.
#' @param type      The type of the source. Default is `"geojson"`.
#'                  Other options include `"vector"` or `"raster"`.
#' @param cluster   Whether to enable clustering for this source. Default is `FALSE`.
#' @return          The map or map proxy object for chaining.
#' @export
add_source <- function(
  map,
  source_id,
  data,
  type = "geojson",
  cluster = FALSE
) {
  if (type == "geojson" && !"geojson" %in% class(data)) {
    data <- geojsonsf::sf_geojson(data)
  }
  source_options <- list(
    type = type,
    data = data,
    cluster = cluster
  )

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addMapSource",
      list(id = map$id, sourceId = source_id, sourceOptions = source_options)
    )
  }
  map$x$sources <- c(
    map$x$sources,
    list(list(sourceId = source_id, sourceOptions = source_options))
  )
  map
}


#' Add a FeatureServer source to the map.
#'
#' @param map         The map or map proxy object.
#' @param source_url  The URL of the FeatureServer source.
#' @param source_id   The ID for the source.
#' @return            The map or map proxy object for chaining.
#' @export
add_feature_server_source <- function(map, source_url, source_id) {
  source_options <- list(
    type = "geojson",
    data = paste0(source_url, "/0/query?where=1=1&outFields=*&f=geojson")
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
#'
#' @param map A toro map object or a map proxy object.
#' @param url The URL of the ArcGIS Image Server.
#' @param source_id A unique identifier for the source.
#' @param ... Additional parameters for the Image Server source.
#' @return The updated map object.
#' @export
add_tiles_from_map_server <- function(map, url, tile_id, as_image_layer = FALSE, ...) {
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
#'
#' @param map A toro map object or a map proxy object.
#' @param url The URL of the ArcGIS Image Server.
#' @param source_id A unique identifier for the source.
#' @param ... Additional parameters for the Image Server source.
#' @return The updated map object.
#' @export
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
#' @param map         The map or map proxy object.
#' @param image_id    The ID of the image source.
#' @param image_url   The URL of the image to add.
#' @return            The map or map proxy object for chaining.
#' @export
add_image <- function(map, image_id, image_url) {
  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addImageSource",
      list(
        id = map$id,
        imageId = image_id,
        imageUrl = image_url
      )
    )
  }
  map$x$imageSources <- c(
    map$x$imageSources,
    list(list(imageId = image_id, imageUrl = image_url))
  )
  map
}


#' Set data for a source on the map.
#'
#' @param proxy     The map proxy object created by `mapProxy()`.
#' @param source_id The ID of the source to update.
#' @param data      The data for the source, typically in GeoJSON format.
#' @param type      The type of the source. Default is `"geojson"`.
#'                  Other options include `"vector"` or `"raster"`.
#' @return          The map proxy object for chaining.
#' @export
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
