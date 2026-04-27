# Add a line layer to a map or map proxy

Add a line layer to a map or map proxy

## Usage

``` r
add_line_layer(map, ...)
```

## Arguments

- map:

  The map object or map proxy to which the layer will be added

- ...:

  Additional arguments to include in the layer definition.

  - clusterOptions: A list of options for clustering, if `can_cluster`
    is `TRUE`. See the [cluster
    vignette](https://epi-interactive-ltd.github.io/toro/articles/layers.html)
    for details on available options

## Value

The updated map object with the line layer added

## Examples

``` r
if (FALSE) { # \dontrun{
# Load libraries
library(toro)
library(spData)
library(sf)

seine_data <- spData::nz_height |>
  sf::st_transform(4326)
seine_data$colour <- rainbow(nrow(seine_data))

map() |>
 set_bounds(bounds = seine_data) |>
 add_circle_layer(
   id = "seine_lines",
   source = seine_data,
   hover_column = "name"
 )

base_map |>
 set_bounds(bounds = seine_data) |>
 add_circle_layer(
   id = "seine_lines",
   source = seine_data,
   hover_column = "name",
   paint = get_paint_options(
     "circle",
     options = list(colour = get_column("colour"))
   )
 )
} # }
```
