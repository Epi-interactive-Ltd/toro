#' Add a legend to a map for a specific layer
#'
#' @param map A toro map or map proxy object.
#' @param layer_id The ID of the layer to which the legend should be associated.
#' @param title Optional title for the legend.
#' @param values Optional vector of values to be displayed in the legend.
#' @param colours Optional vector of colours corresponding to the values in the legend.
#' @param options Optional list of additional legend options (e.g., position, orientation).
#' @return The modified map object with the added legend.
#'
#' @export
#' @example inst/examples/legends.R
add_legend <- function(
  map,
  layer_id,
  title = NULL,
  values = NULL,
  colours = NULL,
  options = list()
) {
  default_legend_config <- list(layerId = layer_id)

  if (!is.null(title)) {
    default_legend_config$title <- title
  }
  if (!is.null(values)) {
    default_legend_config$values <- values
  }
  if (!is.null(colours)) {
    default_legend_config$colours <- colours
  }
  if (!is.null(options) && length(options) > 0) {
    default_legend_config$options <- options
  }

  existing_legends <- map$x$layerLegends
  if (is.null(existing_legends)) {
    existing_legends <- list()
  }

  existing_legends <- Filter(
    function(legend) !identical(legend$layerId, layer_id),
    existing_legends
  )

  map$x$layerLegends <- c(
    existing_legends,
    list(list(layerId = layer_id, legendConfig = default_legend_config))
  )

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addLegendForLayer",
      list(
        id = map$id,
        layerId = layer_id,
        legendConfig = default_legend_config
      )
    )
  }
  map
}

#' Remove a legend from a map for a specific layer
#'
#' @param map A toro map or map proxy object.
#' @param layer_id The ID of the layer for which the legend should be removed.
#' @return The modified map object with the removed legend.
#'
#' @export
#' @example inst/examples/legends.R
remove_legend <- function(map, layer_id) {
  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "removeLegendForLayer",
      list(
        id = map$id,
        layerId = layer_id
      )
    )
  } else {
    existing_legends <- map$x$layerLegends
    if (is.null(existing_legends)) {
      return(map)
    }

    existing_legends <- Filter(
      function(legend) !identical(legend$layerId, layer_id),
      existing_legends
    )

    map$x$layerLegends <- existing_legends
  }
  map
}
