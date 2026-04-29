# Save map as standalone HTML file

This function saves a map widget as a self-contained HTML file that can
be opened in any web browser.

## Usage

``` r
save_map_html(map, filepath, title = "Toro Map", selfcontained = TRUE, ...)
```

## Arguments

- map:

  A map object created by
  [`map()`](https://epi-interactive-ltd.github.io/toro/reference/map.md).

- filepath:

  The file path to save the HTML file (should end with .html).

- title:

  The title for the HTML page. Default is "Toro Map".

- selfcontained:

  Whether to create a self-contained HTML file. Default is TRUE.

- ...:

  Additional arguments passed to
  [`htmlwidgets::saveWidget()`](https://rdrr.io/pkg/htmlwidgets/man/saveWidget.html).

## Value

The file path of the saved HTML file (invisibly).

## Examples

``` r
if (FALSE) { # \dontrun{
# Load library
library(sf)

data <- data.frame(lon = 174.8210, lat = -41.3096) |>
  sf::st_as_sf(coords = c("lon", "lat"), crs = 4326)
# Create and export a map
my_map <- map() |>
  add_circle_layer("epi_circle", source = data)

save_map_html(my_map, "my_map")
} # }
```
