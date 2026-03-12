# Utilities for the map related to layers.

Functions:

- `add_layer`: Add a layer to the map.

- `add_fill_layer`: Add a fill layer to the map.

- `add_circle_layer`: Add a circle layer to the map.

- `add_line_layer`: Add a line layer to the map.

- `add_symbol_layer`: Add a symbol layer to the map.

- `add_lat_lng_grid`: Add a grid of latitude and longitude lines to the
  map.

- `toggle_lat_lng_grid`: Show or hide the latitude and longitude grid.

- `show_layer`: Show a previously hidden layer.

- `hide_layer`: Hide a layer from the map.

- `set_tile_layer`: Set the tile layer for the map.

- `toggle_clustering`: Toggle clustering for a layer.

- `set_paint_property`: Set a paint property for a layer.

- `set_layout_property`: Set a layout property for a layer.

- `get_tile_options`: Get available tile layer options. Add a layer to a
  map or map proxy.

## Usage

``` r
add_layer(
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
)
```

## Arguments

- map:

  The map object or map proxy to which the layer will be added.

- id:

  A unique identifier for the layer.

- type:

  The type of layer to add (e.g., "fill", "circle", "line"). Default is
  "fill".

- source:

  The data source for the layer, if not a GeoJSON, it will be converted.

- paint:

  A list of paint options for styling the layer. See
  [`get_paint_options()`](https://epi-interactive-ltd.github.io/toro/reference/get_paint_options.md)
  for defaults and options.

- layout:

  A list of layout options for the layer. See
  [`get_layout_options()`](https://epi-interactive-ltd.github.io/toro/reference/get_layout_options.md)
  for defaults and options.

- popup_column:

  The column name to use for popups. Default is `NULL`.

- hover_column:

  The column name to use for hover effects. Default is `NULL`.

- can_cluster:

  Whether the layer can be clustered. Default is `FALSE`.

- under_id:

  The ID of an layer already on the map to place this layer under.
  Default is `NULL`.

- filter:

  A filter expression to apply to the layer. Default is `NULL`. See
  [`get_layer_filter()`](https://epi-interactive-ltd.github.io/toro/reference/get_layer_filter.md)
  for more details on how to create filter expressions.

- ...:

  Additional arguments to include in the layer definition.

  - clusterOptions: A list of options for clustering, if `can_cluster`
    is `TRUE`. See the [cluster
    vignette](https://epi-interactive-ltd.github.io/toro/articles/layers.html)
    for details on available options.

## Value

The updated map object with the new layer added.
