#' Get the drawn shape from the map widget.
#'
#' Parses the JSON string returned by the map widget when a shape is drawn.
#' Ensures that the ID of the shape is included in the resulting `sf` object.
#'
#' @param create_input_string A JSON string representing the drawn shape.
#' @return                    A `sf` object representing the drawn shape, or `NULL`.
#' @export
getDrawnShape <- function(create_input_string) {
  if (is.null(create_input_string) || create_input_string == "") {
    return(NULL)
  }
  feat <- jsonlite::fromJSON(create_input_string)
  sf_obj <- geojsonsf::geojson_sf(create_input_string)
  sf_obj$id <- feat$id
  return(sf_obj)
}
