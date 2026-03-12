# Add a cursor coordinates control to the map.

Add a cursor coordinates control to the map.

## Usage

``` r
add_cursor_coords_control(
  map,
  position = "bottom-left",
  long_label = "Lng",
  lat_label = "Lat",
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
)
```

## Arguments

- map:

  The map or map proxy object.

- position:

  The position of the cursor coordinates control on the map. Default is
  `"bottom-left"`. Options include "top-left", "top-right",
  "bottom-left", "bottom-right".

- long_label:

  The label for the longitude coordinate. Default is `"Lng"`.

- lat_label:

  The label for the latitude coordinate. Default is `"Lat"`.

- panel_id:

  ID of control panel to add to (optional).

- section_title:

  Section title when added to a control panel.

## Value

           The map or map proxy object for chaining.

## Examples

``` r
if (interactive()) {
# Add to a map
map() |>
 add_cursor_coords_control()

# Change default options
map() |>
 add_cursor_coords_control(
   position = "top-right",
   long_label = "Longitude",
   lat_label = "Latitude"
 )

# Add to a control panel
map() |>
 add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
 add_cursor_coords_control(panel_id = "my_panel", section_title = "Cursor Coordinates")

# Add to a control panel inside a control group
map() |>
 add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
 add_control_group(
   panel_id = "my_panel",
   group_id = "map_state",
   group_title = "Map State"
   ) |>
 add_cursor_coords_control(panel_id = "my_panel", group_id = "map_state")
}
```
