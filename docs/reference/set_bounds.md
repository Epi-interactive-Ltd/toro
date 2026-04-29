# Set the map bounds

Set the map bounds

## Usage

``` r
set_bounds(map, bounds, padding = 50, max_zoom = map$maxZoom)
```

## Arguments

- map:

  The map or map proxy object.

- bounds:

  One of two formats:

  - A list of two coordinate pairs:
    `list(list(lon1, lat1), list(lon2, lat2))`

  - An `sf` object, which will be converted to a bounding box

- padding:

  The padding around the bounds in pixels. Default is 50.

- max_zoom:

  The maximum zoom level to set. Default is the object's `maxZoom`.

## Value

The map or map proxy object for chaining.

## Examples

``` r
# Load libraries
library(toro)
library(spData)
library(sf)

nz_data <- spData::nz_height |>
  sf::st_transform(4326)

map() |>
  set_bounds(list(list(-79, 43), list(-73, 45)))

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"setBounds":{"bounds":[[-79,43],[-73,45]],"padding":50,"maxZoom":null}},"evals":[],"jsHooks":[]}
map() |>
 set_bounds(bounds = nz_data)

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"setBounds":{"bounds":[[168.0125423302844,-44.62567245229895],[175.5789619553792,-39.26637546136637]],"padding":50,"maxZoom":null}},"evals":[],"jsHooks":[]}
```
