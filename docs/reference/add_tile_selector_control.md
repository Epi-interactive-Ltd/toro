# Functions relating to layer controls on the map. Add a tile selector control to the map or control panel

Functions relating to layer controls on the map. Add a tile selector
control to the map or control panel

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

  Vector of available tile options. If NULL, uses all loaded tiles from
  the map.

- labels:

  Named vector of labels for tiles. If NULL, uses tile names directly.

- default_tile:

  Default tile to select. If NULL, uses current map tile.

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
if (FALSE) { # \dontrun{
all_tiles <- get_tile_options()

map(loadedTiles = all_tiles) |>
 add_tile_selector_control(available_tiles = all_tiles)
} # }
```
