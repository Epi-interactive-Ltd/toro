# Add an image source

## Adding an image source

There are two ways to add an image source to your map:

### The add_image() function

Using the
[`add_image()`](https://epi-interactive-ltd.github.io/toro/reference/add_image.md)
function, you can add an image source by passing the image URL or file
path directly to the `url` argument.

You can pass either a `map`or `mapProxy` object to
[`add_image()`](https://epi-interactive-ltd.github.io/toro/reference/add_image.md).

``` r

library(toro)
library(sf)
#> Warning: package 'sf' was built under R version 4.5.2
#> Linking to GEOS 3.13.0, GDAL 3.8.5, PROJ 9.5.1; sf_use_s2() is TRUE

epi_location <- data.frame(
  lon = 174.82103783265418,
  lat = -41.30961916092329
) |>
  st_as_sf(coords = c("lon", "lat"), crs = 4326)

map() |>
  add_image(
    image_id = "epi_logo",
    image_url = "https://raw.githubusercontent.com/Epi-interactive-Ltd/toro/refs/heads/dev/man/figures/epi-logo.png"
  ) |>
  add_symbol_layer(
    id = "epi",
    source = epi_location,
    layout = get_layout_options(
      "symbol",
      list(
        icon_image = "epi_logo",
        icon_size = 0.1
      )
    )
  ) |>
  set_bounds(epi_location, max_zoom = 13)
```
