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
  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addFeatureServerSource",
      list(
        id = map$id,
        sourceUrl = source_url,
        sourceId = source_id
      )
    )
  }
  map$x$featureSources <- c(
    map$x$featureSources,
    list(list(sourceId = source_id, sourceUrl = source_url))
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
