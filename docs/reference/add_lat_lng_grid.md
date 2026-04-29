# Add a grid of latitude and longitude lines to the map

Add a grid of latitude and longitude lines to the map

## Usage

``` r
add_lat_lng_grid(map, grid_colour = "#000000")
```

## Arguments

- map:

  The map or map proxy object.

- grid_colour:

  The colour of the grid lines. Default is `"#000000"`.

## Value

The map or map proxy object for chaining.

## Examples

``` r
map() |>
 add_lat_lng_grid()

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"latLngGrid":{"gridColour":"#000000"}},"evals":[],"jsHooks":[]}
```
