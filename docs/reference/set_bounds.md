# Set the map bounds

Set the map bounds

## Usage

``` r
set_bounds(map, bounds, padding = 50, max_zoom = map$maxZoom)
```

## Arguments

- map:

  The map or map proxy object

- bounds:

  One of two formats:

  - A list of two coordinate pairs:
    `list(list(lon1, lat1), list(lon2, lat2))`

  - An `sf` object, which will be converted to a bounding box

- padding:

  The padding around the bounds in pixels. Default is 50

- max_zoom:

  The maximum zoom level to set. Default is the object's `maxZoom`

## Value

The map or map proxy object for chaining

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
  set_bounds(list(list(-79, 43), list(-73, 45)))

map() |>
 set_bounds(bounds = nz_data)
} # }
```
