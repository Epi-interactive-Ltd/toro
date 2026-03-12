# Functions relating to layer controls on the map.

Functions:

- add_tile_selector_control: Add a tile selector control to the map or
  control panel.

- remove_tile_selector_control: Remove the tile selector control from
  the map.

- add_layer_selector_control: Add a layer selector control to the map or
  control panel.

- remove_layer_selector_control: Remove the layer selector control from
  the map.

- add_cluster_toggle: Add a cluster toggle control to the map or control
  panel.

- remove_cluster_toggle: Remove a cluster toggle control from the map.

- add_visibility_toggle: Add a visibility toggle control to the map or
  control panel.

- remove_visibility_toggle: Remove a visibility toggle control from the
  map. Add a tile selector control to the map or control panel

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

## Value

             The map or map proxy object for chaining.
