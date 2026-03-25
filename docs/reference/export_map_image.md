# Utilities for the map related to exports. Export map as an image (non-Shiny context).

This function exports a map widget as an image file using webshot2 or
mapview. Works in non-Shiny contexts like RMarkdown, scripts, or
interactive sessions.

## Usage

``` r
export_map_image(
  map,
  filepath,
  width = 800,
  height = 600,
  delay = 2,
  zoom = 1,
  ...
)
```

## Arguments

- map:

  A map object created by
  [`map()`](https://epi-interactive-ltd.github.io/toro/reference/map.md).

- filepath:

  The file path to save the image (including extension).

- width:

  The width of the image in pixels. Default is 800.

- height:

  The height of the image in pixels. Default is 600.

- delay:

  The delay in seconds before capturing. Default is 2.

- zoom:

  The zoom factor for the capture. Default is 1.

- ...:

  Additional arguments passed to webshot2::webshot() or
  mapview::mapshot().

## Value

        The file path of the saved image (invisibly).

## Examples

``` r
if (FALSE) { # \dontrun{
# Create and export a map
my_map <- map() |>
  add_source("earthquakes", quakes_data) |>
  add_circle_layer("quake_circles", source = "earthquakes")

export_map_image(my_map, "earthquake_map.png", width = 1200, height = 800)
} # }
```
