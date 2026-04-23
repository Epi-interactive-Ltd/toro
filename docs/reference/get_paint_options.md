# Get paint options for a specific layer type

This function returns a list of paint options based on the layer type
and any additional options provided.

## Usage

``` r
get_paint_options(layer_type, options = list())
```

## Arguments

- layer_type:

  A string indicating the type of layer (e.g., "fill", "circle",
  "line").

- options:

  A list of additional options to customize the paint properties. See
  Maplibre docs for full options.

  - colour: The color to use for the layer. Default is "grey". `color`
    is also accepted as an alias for `colour`.

  - opacity: The opacity to use for the layer. Default is 1 (fully
    opaque).

  - line_width: The width of lines in line layers or the outline width
    for circle layers. Default is 1.

  - line_dash: The dash pattern for line layers. Default is no dash
    (solid line). You can provide a vector of numbers to specify the
    dash pattern (e.g., c(2, 4) for a pattern of 2 units on, 4 units
    off).

  - outline_colour: The color to use for the outline of circle or fill
    layers. Default is the same as `colour`. `outline_color` is also
    accepted as an alias for `outline_colour`.

  - outline_opacity: The opacity to use for the outline of circle or
    fill layers. Default is the same as `opacity`. You can also provide
    any other paint options found in the Maplibre docs for the specific
    layer type, and they will be included in the returned list.

## Value

A list of paint options suitable for the specified layer type.

## Note

You can provide any paint options found in the [Maplibre Layers
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
get_paint_options("line", list(colour = "blue", opacity = 0.8, line_width = 2))

get_paint_options("circle", list(colour = "red", circle_radius = 10, outline_colour = "black"))

# Use with get_column for data-driven styling:
get_paint_options("fill", list(colour = get_column("color"), opacity = get_column("opacity")))

get_paint_options("fill", list(
   colour = get_column_group("group", c("A" = "green", "B" = "blue"))
))

get_paint_options("fill", list(
   opacity = get_column_step_steps("percent", c(25, 75), c("red", "orange", "yellow"))
))

# Provide options outside of the defaults
get_paint_options("circle", list("circle-blur" = 0.5))
} # }
```
