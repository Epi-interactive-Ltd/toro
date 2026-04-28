# Create a MapLibre map widget

This function creates a map htmlwidget for use in R and Shiny
applications.

## Usage

``` r
map(
  style = "lightgrey",
  center = c(174, -41),
  zoom = 2,
  width = "100%",
  height = NULL,
  session = shiny::getDefaultReactiveDomain(),
  ...
)
```

## Arguments

- style:

  The style of the map. Default is "lightgrey"

- center:

  The initial center of the map as a longitude/latitude pair. Default is
  c(174, -41)

- zoom:

  The initial zoom level of the map. Default is 2

- width:

  The width of the widget. Optional

- height:

  The height of the widget. Optional

- session:

  The Shiny session object. Default is the current session

- ...:

  Additional options to customize the map.

  - minZoom: Minimum zoom level (0-24). Default is 2

  - maxZoom: Maximum zoom level (0-24). Default is 18

  - clusterColour: The colour of the cluster circles. Default is
    "#808080"

  - loadedTiles: A character vector of tile ids to load, or a named list
    of tile options. Full options: c("natgeo", "satellite", "topo",
    "terrain", "streets", "shaded", "lightgrey"). Default is
    c("lightgrey", "satellite")

  - initialTileLayer: The tile layer to use when the map is first
    loaded. Default is NULL (the first layer in loadedTiles)

  - backgroundColour: The background colour of the map. Default is
    "#D0CFD4"

  - enable3D: Whether to enable 3D dragging/view. Default is FALSE

  - initialLoadedLayers: A character vector of layer ids that should be
    loaded before the initial map spinner is hidden. Default is NULL

  - spinnerWhileBusy: Whether to show a spinner while the map is busy
    (e.g. loading tiles). Default is FALSE

  - busyLoaderBgColour: The background colour of the busy loader.
    Default is "rgba(0, 0, 0, 0.2)"

  - busyLoaderColour: The colour of the busy loader. Default is "white"

  - initialLoaderBgColour: The background colour of the initial loader.
    Default is "white"

  - initialLoaderColour: The colour of the initial loader. Default is
    "black"

  - clusterOptions: A list of options for clustering, if `can_cluster`
    is `TRUE`. See the [cluster
    vignette](https://epi-interactive-ltd.github.io/toro/articles/layers.html)
    for details on available options

  - attributionPosition: The position of the attribution control.
    Default is "bottom-right"

## Value

An object of class `htmlwidget` representing the map

## Examples

``` r
if (FALSE) { # \dontrun{
map()

map(loadedTiles = c("natgeo", "streets"))

# Add maxzoom to satellite layer
map(loadedTiles = list(natgeo = list(), satellite = list(maxZoom = 2)))
} # }
```
