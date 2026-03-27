# Add a circle layer to a map or map proxy.

Add a circle layer to a map or map proxy.

## Usage

``` r
add_circle_layer(map, ...)
```

## Arguments

- map:

  The map object or map proxy to which the layer will be added.

- ...:

  Additional arguments to include in the layer definition.

  - clusterOptions: A list of options for clustering, if `can_cluster`
    is `TRUE`. See the [cluster
    vignette](https://epi-interactive-ltd.github.io/toro/articles/layers.html)
    for details on available options.

## Value

The updated map object with the circle layer added.

## Examples

``` r
if (FALSE) { # \dontrun{
# Load libraries
library(toro)
library(spData)
library(sf)

nz_data <- spData::nz_height |>
  sf::st_transform(4326)

map() |>
 set_bounds(bounds = nz_data) |>
 add_circle_layer(
   id = "nz_elevation",
   source = nz_data,
   hover_column = "elevation"
 )

base_map |>
 set_bounds(bounds = nz_data) |>
 add_circle_layer(
   id = "nz_elevation",
   source = nz_data,
   hover_column = "elevation",
   paint = get_paint_options(
     "circle",
     options = list(
       colour = get_column_step_steps(
         "elevation",
         c(3000),
         c("grey", "black")
       )
     )
   )
 )
} # }
```
