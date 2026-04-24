# Functions related to zoom controls. Add a zoom control to the map.

Functions related to zoom controls. Add a zoom control to the map.

## Usage

``` r
add_zoom_control(
  map,
  position = "top-right",
  control_options = list(),
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
)
```

## Arguments

- map:

  The map or map proxy object.

- position:

  The position of the zoom control on the map. Default is `"top-right"`.

- control_options:

  Additional options for the zoom control. Default is an empty list.

- panel_id:

  ID of control panel to add to (optional).

- section_title:

  Section title when added to a control panel.

- group_id:

  Optional ID of the group to add the control to within a panel.

## Value

The map proxy object for chaining.

## Note

See [MapLibre NavigationControl
docs](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/NavigationControlOptions/)
for more information on available options.

## Examples

``` r
if (FALSE) { # \dontrun{
add_zoom_control(map())

# Inside a control panel
map() |>
 add_control_panel(panel_id = "my_panel", title = "View Controls") |>
 add_zoom_control(panel_id = "my_panel")
} # }
```
