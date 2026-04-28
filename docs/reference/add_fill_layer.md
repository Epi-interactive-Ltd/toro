# Add a fill layer to a map or map proxy

Add a fill layer to a map or map proxy

## Usage

``` r
add_fill_layer(map, ...)
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

The updated map object with the fill layer added

## Examples

``` r
if (FALSE) { # \dontrun{
# Load libraries
library(toro)
library(spData)
library(sf)

nz_data <- spData::nz |>
  rename(geometry = geom) |>
  sf::st_transform(4326)

map() |>
 add_fill_layer(
   id = "nz_regions",
   source = nz_data,
   hover_column = "Name"
 )

map() |>
 add_fill_layer(
   id = "nz_regions",
   source = nz_data,
   hover_column = "Name",
   paint = get_paint_options(
     "fill",
     options = list(
       colour = "#a3b18a",
       opacity = 0.3,
       outline_colour = "#588157"
     )
   )
 )
} # }
```
