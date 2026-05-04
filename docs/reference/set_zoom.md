# Set the map zoom level

Set the map zoom level

## Usage

``` r
set_zoom(map, zoom)
```

## Arguments

- map:

  The map or map proxy object.

- zoom:

  The zoom level to set. Default is 2.

## Value

The map or map proxy object for chaining.

## Examples

``` r
 map() |>
  set_zoom(5)

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"setZoom":5},"evals":[],"jsHooks":[]}
```
