# Add a text layer to a map or map proxy. This layer is typically used for text labels.

Add a text layer to a map or map proxy. This layer is typically used for
text labels.

## Usage

``` r
add_text_layer(map, ...)
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

The updated map object with the text layer added.

## Examples

``` r
if (FALSE) { # \dontrun{
# Load libraries
library(toro)
library(sf)

# Prepare data
data(quakes)
quakes_data <- quakes |>
 st_as_sf(coords = c("long", "lat"), crs = 4326)

# Create map and add fill layer
map() |>
 add_text_layer(
   id = "test_layer",
   source = quakes_data
 )
} # }
```
