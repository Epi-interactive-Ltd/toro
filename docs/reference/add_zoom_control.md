# Functions related to zoom controls.

Functions:

- add_zoom_control: Add a zoom control to the map or control panel.

- remove_zoom_control: Remove the zoom control from the map. Add a zoom
  control to the map.

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

## Value

               The map proxy object for chaining.

## Note

See [Maplibre NavigationControl
docs](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/NavigationControlOptions/)
for more information on available options.
