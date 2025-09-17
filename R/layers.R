#' Utilities for the map related to layers.
#'
#' Functions:
#' - `add_layer`: Add a layer to the map.
#' - `add_fill_layer`: Add a fill layer to the map.
#' - `add_circle_layer`: Add a circle layer to the map.
#' - `add_line_layer`: Add a line layer to the map.
#' - `add_symbol_layer`: Add a symbol layer to the map.
#' - `add_lat_lng_grid`: Add a grid of latitude and longitude lines to the map.
#' - `toggle_lat_lng_grid`: Show or hide the latitude and longitude grid.
#' - `show_layer`: Show a previously hidden layer.
#' - `hide_layer`: Hide a layer from the map.
#' - `set_tile_layer`: Set the tile layer for the map.
#' - `toggle_clustering`: Toggle clustering for a layer.
#' - `set_paint_property`: Set a paint property for a layer.
#' - `set_layout_property`: Set a layout property for a layer.
#' - `get_tile_options`: Get available tile layer options.

#' Add a layer to a map or map proxy.
#'
#' @param map           The map object or map proxy to which the layer will be added.
#' @param id            A unique identifier for the layer.
#' @param type          The type of layer to add (e.g., "fill", "circle", "line").
#' @param source        The data source for the layer, if not a GeoJSON, it will be converted.
#' @param paint         A list of paint options for styling the layer.
#' @param layout        A list of layout options for the layer.
#' @param popup_column  The column name to use for popups. Default is `NULL`.
#' @param hover_column  The column name to use for hover effects. Default is `NULL`.
#' @param can_cluster   Whether the layer can be clustered. Default is `FALSE`.
#' @param under_id      The ID of another layer to place this layer under. Default is `NULL`.
#' @param filter        A filter expression to apply to the layer. Default is `NULL`.
#' @return              The updated map object with the new layer added.
#' @export
add_layer <- function(
  map,
  id,
  type = "fill",
  source,
  paint = NULL,
  layout = NULL,
  popup_column = NULL,
  hover_column = NULL,
  can_cluster = FALSE,
  under_id = NULL,
  filter = NULL
) {
  if (is.null(paint)) {
    paint <- toro::get_paint_options(type)
  }
  if (is.null(layout)) {
    layout <- toro::get_layout_options(type)
  }

  # Need source to be a GeoJSON
  if (any(c("sf", "data.frame", "tbl") %in% class(source))) {
    if (length(colnames(source)) == 1) {
      # There is only a geometry column.
      # To convert to geojson, we need to add a dummy column.
      source$id <- seq_len(nrow(source))
    }
    geojson <- geojsonsf::sf_geojson(source)

    source <- list(type = "geojson", data = geojson, generateId = TRUE)
  }

  layer <- list(
    id = id,
    type = type,
    source = source,
    paint = paint,
    layout = layout,
    popupColumn = popup_column,
    hoverColumn = hover_column,
    canCluster = can_cluster,
    filter = filter,
    beforeId = under_id
  )

  map$x$layers <- c(map$x$layers, list(layer))

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage("addLayer", layer)
  }
  map
}

#' Add a fill layer to a map or map proxy.
#'
#' @inheritParams add_layer
#' @return The updated map object with the fill layer added.
#' @export
add_fill_layer <- function(map, ...) {
  add_layer(map = map, type = "fill", ...)
}

#' Add a circle layer to a map or map proxy.
#'
#' @inheritParams add_layer
#' @return The updated map object with the circle layer added.
#' @export
add_circle_layer <- function(map, ...) {
  add_layer(map = map, type = "circle", ...)
}

#' Add a line layer to a map or map proxy.
#'
#' @inheritParams add_layer
#' @return The updated map object with the line layer added.
#' @export
add_line_layer <- function(map, ...) {
  add_layer(map = map, type = "line", ...)
}

#' Add a symbol layer to a map or map proxy.
#' This layer is typically used for icons or text labels.
#'
#' @inheritParams add_layer
#' @return The updated map object with the symbol layer added.
#' @export
add_symbol_layer <- function(map, ...) {
  add_layer(map = map, type = "symbol", ...)
}

#' Add a grid of latitude and longitude lines to the map.
#'
#' @param map         The map or map proxy object.
#' @param grid_colour The colour of the grid lines. Default is `"#000000"`.
#' @return            The map or map proxy object for chaining.
#' @export
add_lat_lng_grid <- function(map, grid_colour = "#000000") {
  grid_control <- list(gridColour = grid_colour)

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addLatLngGrid",
      list(id = map$id, gridColour = grid_colour)
    )
  }

  if (is.null(map$x$latLngGrid)) {
    map$x$latLngGrid <- grid_control # Check that the control is not already added
  }
  map
}

#' Show/hide the latitude and longitude grid on the map.
#'
#' @param proxy The map proxy object created by `mapProxy()`.
#' @param show  Logical indicating whether to show or hide the grid. Default is `TRUE`.
#' @return      The map proxy object for chaining.
#' @export
toggle_lat_lng_grid <- function(proxy, show = TRUE) {
  proxy$session$sendCustomMessage(
    "toggleLatLngGrid",
    list(id = proxy$id, show = show)
  )
  proxy
}

#' Show a previously hidden layer on the map.
#'
#' @param proxy     The map proxy object created by `mapProxy()`.
#' @param layer_id  The ID of the layer to show.
#' @return          The map proxy object for chaining.
#' @export
show_layer <- function(proxy, layer_id) {
  proxy$session$sendCustomMessage(
    "showLayer",
    list(id = proxy$id, layerId = layer_id)
  )
  proxy
}


#' Hide a layer from the map.
#'
#' @note This does not remove the layer, it only hides it from view.
#'
#' @param proxy     The map proxy object created by `mapProxy()`.
#' @param layer_id  The ID of the layer to hide.
#' @return          The map proxy object for chaining.
#' @export
hide_layer <- function(proxy, layer_id) {
  proxy$session$sendCustomMessage(
    "hideLayer",
    list(id = proxy$id, layerId = layer_id)
  )
  proxy
}

#' Set the tile layer for the map.
#'
#' @param map   The map or map proxy object.
#' @param tiles A character vector of tile layer names.
#'              Options include "natgeo", "satellite", "topo", "terrain",
#'              "streets", "shaded", "light-grey".
#' @return      The map or map proxy object for chaining.
#' @export
set_tile_layer <- function(map, tiles) {
  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "setSelectedTiles",
      list(id = map$id, tiles = tiles)
    )
  }
  map$x$initialTileLayer <- tiles
  map
}

#' Toggle clustering for a layer on the map.
#'
#' @param proxy     The map proxy object created by `mapProxy()`.
#' @param layer_id  The ID of the layer to toggle clustering for.
#' @param cluster   Whether to enable clustering. Default is `FALSE`.
#' @return          The map proxy object for chaining.
#' @export
toggle_clustering <- function(proxy, layer_id, cluster = FALSE) {
  proxy$session$sendCustomMessage(
    "toggleClustering",
    list(
      id = proxy$id,
      layerId = layer_id,
      cluster = cluster
    )
  )
  proxy
}


#' Set a paint property for a layer on the map.
#'
#' @param proxy         The map proxy object created by `mapProxy()`.
#' @param layer_id      The ID of the layer to update.
#' @param property_name The name of the paint property to set.
#' @param value         The value to set for the paint property.
#' @return              The map proxy object for chaining.
#' @export
set_paint_property <- function(proxy, layer_id, property_name, value) {
  proxy$session$sendCustomMessage(
    "setPaintProp",
    list(
      id = proxy$id,
      layerId = layer_id,
      property = property_name,
      value = value
    )
  )
  proxy
}


#' Set a layout property for a layer on the map.
#'
#' @param proxy         The map proxy object created by `mapProxy()`.
#' @param layer_id      The ID of the layer to update.
#' @param property_name The name of the layout property to set.
#' @param value         The value to set for the layout property.
#' @return              The map proxy object for chaining.
#' @export
set_layout_property <- function(proxy, layer_id, property_name, value) {
  proxy$session$sendCustomMessage(
    "setLayoutProp",
    list(
      id = proxy$id,
      layerId = layer_id,
      property = property_name,
      value = value
    )
  )
  proxy
}

#' Get available tile layer options.
#'
#' @return A character vector of available tile layer options.
#' @export
get_tile_options <- function() {
  c("natgeo", "satellite", "topo", "terrain", "streets", "shaded", "light-grey")
}
