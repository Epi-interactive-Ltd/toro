#' Get the sf data frame of a clicked feature from the map widget.
#'
#' The click input is a list containing the `layerId`, `properties`, `geometry`, and
#' `time`. Turn this into an `sf` object.
#'
#' @note `time` is not used in this function, but it is included in the input so that
#' the same feature can be clicked multiple times and the changed time means that the
#' input will be updated.
#'
#' @param clicked_feature_input A list representing the drawn shape.
#' @return                      A `sf` object representing the clicked feature, or `NULL`.
#' @export
getClickedFeature <- function(clicked_feature_input) {
  if (
    is.null(clicked_feature_input) ||
      class(clicked_feature_input) != "list" ||
      length(clicked_feature_input) == 0
  ) {
    return(NULL)
  }
  # Build a GeoJSON Feature from the list
  geojson <- list(
    type = "Feature",
    layer_id = clicked_feature_input$layerId,
    properties = clicked_feature_input$properties,
    geometry = clicked_feature_input$geometry
  )
  # Convert to JSON and then to sf
  sf_obj <- geojsonsf::geojson_sf(jsonlite::toJSON(geojson, auto_unbox = TRUE))
  return(sf_obj)
}
