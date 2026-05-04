# Add a tile selector control to the map or control panel

Add a tile selector control to the map or control panel

## Usage

``` r
add_tile_selector_control(
  map,
  available_tiles = NULL,
  labels = NULL,
  default_tile = NULL,
  position = "top-right",
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
)
```

## Arguments

- map:

  The map or map proxy object.

- available_tiles:

  Vector of available tile options. If `NULL`, uses all loaded tiles
  from the map.

- labels:

  Named vector of labels for tiles. If `NULL`, uses tile names directly.

- default_tile:

  Default tile to select. If `NULL`, uses current map tile.

- position:

  Position on the map if not using a control panel. Default is
  "top-right".

- panel_id:

  ID of control panel to add to (optional).

- section_title:

  Section title when added to a control panel.

- group_id:

  ID of control group to add to (optional).

## Value

The map or map proxy object for chaining.

## Examples

``` r
# Add a tile selector that gives the ability to switch between all available tilesets
all_tiles <- get_tile_options()

map(loadedTiles = all_tiles) |>
 add_tile_selector_control(available_tiles = all_tiles)

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["natgeo","satellite","topo","terrain","streets","shaded","lightgrey"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"tileSelectorControls":{"standalone_tile_selector":{"availableTiles":["natgeo","satellite","topo","terrain","streets","shaded","lightgrey"],"labels":{"natgeo":"National Geographic","satellite":"Satellite","topo":"Topographic","terrain":"Terrain","streets":"Streets","shaded":"Shaded","lightgrey":"Light Grey"},"defaultTile":null,"position":"top-right","useControlPanel":false,"panelId":null,"panelTitle":null,"groupId":null}}},"evals":[],"jsHooks":[]}
```
