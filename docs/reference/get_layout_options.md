# Get layout options for a specific layer type

This function returns a list of layout options based on the layer type
and any additional options provided.

## Usage

``` r
get_layout_options(layer_type, options = list())
```

## Arguments

- layer_type:

  A string indicating the type of layer (e.g., "fill", "circle",
  "line").

- options:

  A list of additional options to customize the layout properties. See
  MapLibre docs for options.

  - line_cap: A list of options for the line cap, if `layer_type` is
    "line". Default is "round".

  - line_join: A list of options for the line join, if `layer_type` is
    "line". Default is "round".

  - icon_image: The name of the icon image to use for symbol layers, if
    `layer_type` is "symbol". Default is "toro-pin".

  - icon_size: The size of the icon for symbol layers, if `layer_type`
    is "symbol". Default is 1.

  - icon_anchor: The anchor point for the icon in symbol layers, if
    `layer_type` is "symbol". Default is "bottom".

  - text_anchor: The anchor point for the text in symbol layers, if
    `layer_type` is "symbol". Default is "center".

  - icon_offset: The offset for the icon in symbol layers, if
    `layer_type` is "symbol". Default is list(0, 0).

  - icon_allow_overlap: Whether to allow icons to overlap in symbol
    layers, if `layer_type` is "symbol". Default is TRUE.

  - text_allow_overlap: Whether to allow text to overlap in symbol
    layers, if `layer_type` is "symbol". Default is TRUE.

  - icon_rotate: The rotation angle for icons in symbol layers, if
    `layer_type` is "symbol". Default is 0.

  - icon_flip_horizontal: Whether to flip icons horizontally in symbol
    layers, if `layer_type` is "symbol". Default is FALSE. Note that
    this uses the `icon-flip-horizontal` property in MapLibre, which may
    not be supported by all icons.

  - text_font: The font for text in symbol layers, if `layer_type` is
    "symbol". Default is "Open Sans Regular".

  - text_field: The text field for symbol layers, if `layer_type` is
    "symbol". Default is NULL, which means no text will be shown. This
    can be set to a column value using `get_column` or other functions
    to show text from the data.

  - text_size: The size of the text in symbol layers, if `layer_type` is
    "symbol". Default is 12. You can also provide any other layout
    options found in the MapLibre docs for the specific layer type, and
    they will be included in the returned list.

## Value

A list of layout options suitable for the specified layer type.

## Note

You can provide any layout options found in the [MapLibre Layers
docs](https://maplibre.org/maplibre-style-spec/layers/) in the `options`
argument, and they will be included in the returned list. The default
options are just a starting point and can be overridden by providing
them in the `options` argument.

## See also

[`get_column`](https://epi-interactive-ltd.github.io/toro/reference/get_column.md),
[`get_column_group`](https://epi-interactive-ltd.github.io/toro/reference/get_column_group.md),
[`get_column_step_steps`](https://epi-interactive-ltd.github.io/toro/reference/get_column_step_steps.md)

## Examples

``` r
if (FALSE) { # \dontrun{
get_layout_options("line", list(line_cap = "butt", line_join = "bevel"))

get_layout_options("symbol", list(icon_image = "yellow_pin", icon_size = 1.5))

# For horizontal flipping, provide left/right versions of your icon or use rotation fallback
get_layout_options("symbol", list(icon_image = "arrow", icon_flip_horizontal = TRUE))

# Provide options outside of the defaults
get_layout_options(
 "circle",
 list(
   "circle-sort-key" = get_column_step_steps(
     "elevation",
     c(3000),
     c(100, 200)
   )
 )
)
} # }
```
