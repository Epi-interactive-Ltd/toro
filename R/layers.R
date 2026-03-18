#' Utilities for the map related to layers.

#' Add a layer to a map or map proxy.
#'
#' @param map The map object or map proxy to which the layer will be added.
#' @param id  A unique identifier for the layer.
#' @param type The type of layer to add (e.g., "fill", "circle", "line").
#'  Default is "fill".
#' @param source The data source for the layer, if not a GeoJSON, it will be converted.
#' @param paint A list of paint options for styling the layer. See `get_paint_options()`
#'  for defaults and options.
#' @param layout A list of layout options for the layer. See `get_layout_options()` for defaults
#'  and options.
#' @param popup_column The column name to use for popups. Default is `NULL`.
#' @param hover_column The column name to use for hover effects. Default is `NULL`.
#' @param can_cluster Whether the layer can be clustered. Default is `FALSE`.
#' @param under_id The ID of an layer already on the map to place this layer under.
#'  Default is `NULL`.
#' @param filter A filter expression to apply to the layer. Default is `NULL`. See
#'  `get_layer_filter()` for more details on how to create filter expressions.
#' @param ... Additional arguments to include in the layer definition.
#'  \itemize{
#'    \item clusterOptions: A list of options for clustering, if `can_cluster` is `TRUE`.
#'      See the [cluster vignette](https://epi-interactive-ltd.github.io/toro/articles/layers.html)
#'      for details on available options.
#'  }
#' @return The updated map object with the new layer added.
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
  filter = NULL,
  ...
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
  extra_args <- list(...)
  if (length(extra_args) > 0) {
    layer <- c(layer, extra_args)
  }

  map$x$layers <- c(map$x$layers, list(layer))

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage("addLayer", list(id = map$id, layer = layer))
  }
  map
}

#' Add a fill layer to a map or map proxy.
#'
#' @inheritParams add_layer
#' @return The updated map object with the fill layer added.
#' @export
#'
#' @examples
#' \dontrun{
#' # Load libraries
#' library(toro)
#' library(spData)
#' library(sf)
#'
#' nz_data <- spData::nz |>
#'   rename(geometry = geom) |>
#'   sf::st_transform(4326)
#'
#' map() |>
#'  add_fill_layer(
#'    id = "nz_regions",
#'    source = nz_data,
#'    hover_column = "Name"
#'  )
#'
#' map() |>
#'  add_fill_layer(
#'    id = "nz_regions",
#'    source = nz_data,
#'    hover_column = "Name",
#'    paint = get_paint_options(
#'      "fill",
#'      options = list(
#'        colour = "#a3b18a",
#'        opacity = 0.3,
#'        outline_colour = "#588157"
#'      )
#'    )
#'  )
#' }
add_fill_layer <- function(map, ...) {
  add_layer(map = map, type = "fill", ...)
}

#' Add a circle layer to a map or map proxy.
#'
#' @inheritParams add_layer
#' @return The updated map object with the circle layer added.
#' @export
#'
#' @examples
#' \dontrun{
#' # Load libraries
#' library(toro)
#' library(spData)
#' library(sf)
#'
#' nz_data <- spData::nz_height |>
#'   sf::st_transform(4326)
#'
#' map() |>
#'  set_bounds(bounds = nz_data) |>
#'  add_circle_layer(
#'    id = "nz_elevation",
#'    source = nz_data,
#'    hover_column = "elevation"
#'  )
#'
#' base_map |>
#'  set_bounds(bounds = nz_data) |>
#'  add_circle_layer(
#'    id = "nz_elevation",
#'    source = nz_data,
#'    hover_column = "elevation",
#'    paint = get_paint_options(
#'      "circle",
#'      options = list(
#'        colour = get_column_step_steps(
#'          "elevation",
#'          c(3000),
#'          c("grey", "black")
#'        )
#'      )
#'    )
#'  )
#' }
add_circle_layer <- function(map, ...) {
  add_layer(map = map, type = "circle", ...)
}

#' Add a line layer to a map or map proxy.
#'
#' @inheritParams add_layer
#' @return The updated map object with the line layer added.
#' @export
#'
#' @examples
#' \dontrun{
#' # Load libraries
#' library(toro)
#' library(spData)
#' library(sf)
#'
#' seine_data <- spData::nz_height |>
#'   sf::st_transform(4326)
#' seine_data$colour <- rainbow(nrow(seine_data))
#'
#' map() |>
#'  set_bounds(bounds = seine_data) |>
#'  add_circle_layer(
#'    id = "seine_lines",
#'    source = seine_data,
#'    hover_column = "name"
#'  )
#'
#' base_map |>
#'  set_bounds(bounds = seine_data) |>
#'  add_circle_layer(
#'    id = "seine_lines",
#'    source = seine_data,
#'    hover_column = "name",
#'    paint = get_paint_options(
#'      "circle",
#'      options = list(colour = get_column("colour"))
#'    )
#'  )
#' }
add_line_layer <- function(map, ...) {
  add_layer(map = map, type = "line", ...)
}

#' Add a symbol layer to a map or map proxy.
#' This layer is typically used for icons or pins.
#'
#' @inheritParams add_layer
#' @return The updated map object with the symbol layer added.
#' @export
#'
#' @examples
#' \dontrun{
#' # Load libraries
#' library(toro)
#' library(sf)
#'
#' # Prepare data
#' data(quakes)
#' quakes_data <- quakes |>
#'  st_as_sf(coords = c("long", "lat"), crs = 4326)
#'
#' # Create map and add fill layer
#' map() |>
#'  add_symbol_layer(
#'    id = "test_layer",
#'    source = quakes_data
#'  )
#' }
add_symbol_layer <- function(map, ...) {
  add_layer(map = map, type = "symbol", ...)
}

#' Add a text layer to a map or map proxy.
#' This layer is typically used for text labels.
#'
#' @inheritParams add_layer
#' @return The updated map object with the text layer added.
#' @export
#'
#' @examples
#' \dontrun{
#' # Load libraries
#' library(toro)
#' library(sf)
#'
#' # Prepare data
#' data(quakes)
#' quakes_data <- quakes |>
#'  st_as_sf(coords = c("long", "lat"), crs = 4326)
#'
#' # Create map and add fill layer
#' map() |>
#'  add_text_layer(
#'    id = "test_layer",
#'    source = quakes_data
#'  )
#' }
add_text_layer <- function(map, ...) {
  add_layer(map = map, type = "text", ...)
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
#'              "streets", "shaded", "lightgrey".
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
  c("natgeo", "satellite", "topo", "terrain", "streets", "shaded", "lightgrey")
}
