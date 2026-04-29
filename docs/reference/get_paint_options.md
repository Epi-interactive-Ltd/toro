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
  MapLibre docs for full options.

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
    any other paint options found in the MapLibre docs for the specific
    layer type, and they will be included in the returned list.

## Value

A list of paint options suitable for the specified layer type.

## Note

You can provide any paint options found in the [MapLibre Layers
docs](https://maplibre.org/maplibre-style-spec/layers/) in the `options`
argument, and they will be included in the returned list. The default
options are just a starting point and can be overridden by providing
them in the `options` argument.

## See also

[`get_column()`](https://epi-interactive-ltd.github.io/toro/reference/get_column.md)
for getting options from column values directly,
[`get_column_group()`](https://epi-interactive-ltd.github.io/toro/reference/get_column_group.md)
for getting options by spiliting column values into groups, and
[`get_column_steps()`](https://epi-interactive-ltd.github.io/toro/reference/get_column_steps.md)
for getting options by spiliting column values into groups based on
steps.

## Examples

``` r
get_paint_options("line", list(colour = "blue", opacity = 0.8, line_width = 2))
#> $`line-color`
#> [1] "blue"
#> 
#> $`line-opacity`
#> [1] 0.8
#> 
#> $`line-width`
#> [1] 2
#> 
#> $`line-dasharray`
#> $`line-dasharray`[[1]]
#> [1] 1
#> 
#> $`line-dasharray`[[2]]
#> [1] 0
#> 
#> 

get_paint_options("circle", list(colour = "red", circle_radius = 10, outline_colour = "black"))
#> $`circle-color`
#> [1] "red"
#> 
#> $`circle-opacity`
#> [1] 1
#> 
#> $`circle-radius`
#> [1] 10
#> 
#> $`circle-stroke-color`
#> [1] "black"
#> 
#> $`circle-stroke-opacity`
#> [1] 1
#> 
#> $`circle-stroke-width`
#> [1] 1
#> 

# Use with get_column for data-driven styling:
get_paint_options("fill", list(colour = get_column("color"), opacity = get_column("opacity")))
#> $`fill-color`
#> $`fill-color`[[1]]
#> [1] "get"
#> 
#> $`fill-color`[[2]]
#> [1] "color"
#> 
#> 
#> $`fill-opacity`
#> $`fill-opacity`[[1]]
#> [1] "get"
#> 
#> $`fill-opacity`[[2]]
#> [1] "opacity"
#> 
#> 
#> $`fill-outline-color`
#> $`fill-outline-color`[[1]]
#> [1] "get"
#> 
#> $`fill-outline-color`[[2]]
#> [1] "color"
#> 
#> 

get_paint_options("fill", list(
   colour = get_column_group("group", c("A" = "green", "B" = "blue"))
))
#> $`fill-color`
#> $`fill-color`[[1]]
#> [1] "match"
#> 
#> $`fill-color`[[2]]
#> $`fill-color`[[2]][[1]]
#> [1] "get"
#> 
#> $`fill-color`[[2]][[2]]
#> [1] "group"
#> 
#> 
#> $`fill-color`[[3]]
#> [1] "A"
#> 
#> $`fill-color`[[4]]
#> [1] "green"
#> 
#> $`fill-color`[[5]]
#> [1] "B"
#> 
#> $`fill-color`[[6]]
#> [1] "blue"
#> 
#> $`fill-color`[[7]]
#> [1] "#cccccc"
#> 
#> 
#> $`fill-opacity`
#> [1] 1
#> 
#> $`fill-outline-color`
#> $`fill-outline-color`[[1]]
#> [1] "match"
#> 
#> $`fill-outline-color`[[2]]
#> $`fill-outline-color`[[2]][[1]]
#> [1] "get"
#> 
#> $`fill-outline-color`[[2]][[2]]
#> [1] "group"
#> 
#> 
#> $`fill-outline-color`[[3]]
#> [1] "A"
#> 
#> $`fill-outline-color`[[4]]
#> [1] "green"
#> 
#> $`fill-outline-color`[[5]]
#> [1] "B"
#> 
#> $`fill-outline-color`[[6]]
#> [1] "blue"
#> 
#> $`fill-outline-color`[[7]]
#> [1] "#cccccc"
#> 
#> 

get_paint_options("fill", list(
   opacity = get_column_steps("percent", c(25, 75), c("red", "orange", "yellow"))
))
#> $`fill-color`
#> [1] "grey"
#> 
#> $`fill-opacity`
#> $`fill-opacity`[[1]]
#> [1] "step"
#> 
#> $`fill-opacity`[[2]]
#> $`fill-opacity`[[2]][[1]]
#> [1] "get"
#> 
#> $`fill-opacity`[[2]][[2]]
#> [1] "percent"
#> 
#> 
#> $`fill-opacity`[[3]]
#> [1] "red"
#> 
#> $`fill-opacity`[[4]]
#> [1] 25
#> 
#> $`fill-opacity`[[5]]
#> [1] "orange"
#> 
#> $`fill-opacity`[[6]]
#> [1] 75
#> 
#> $`fill-opacity`[[7]]
#> [1] "yellow"
#> 
#> 
#> $`fill-outline-color`
#> [1] "grey"
#> 

# Provide options outside of the defaults
get_paint_options("circle", list("circle-blur" = 0.5))
#> $`circle-color`
#> [1] "grey"
#> 
#> $`circle-opacity`
#> [1] 1
#> 
#> $`circle-radius`
#> [1] 5
#> 
#> $`circle-stroke-color`
#> [1] "grey"
#> 
#> $`circle-stroke-opacity`
#> [1] 1
#> 
#> $`circle-stroke-width`
#> [1] 1
#> 
#> $`circle-blur`
#> [1] 0.5
#> 
```
