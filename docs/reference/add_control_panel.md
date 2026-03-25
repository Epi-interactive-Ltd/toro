# Functions to manage control panel elements in a map. Add a control panel to the map

Creates a flexible control panel that can contain multiple controls.

## Usage

``` r
add_control_panel(
  map,
  panel_id,
  title = NULL,
  position = "bottom-left",
  collapsible = FALSE,
  collapsed = FALSE,
  direction = "column",
  custom_controls = NULL
)
```

## Arguments

- map:

  The map or map proxy object.

- panel_id:

  Unique identifier for the control panel.

- title:

  Title for the control panel. If NULL, no title is shown.

- position:

  Position of the control panel on the map. Default is "bottom-left".
  Options include "top-left", "top-right", "bottom-left",
  "bottom-right".

- collapsible:

  Whether the panel can be collapsed. Default is FALSE.

- collapsed:

  Initial collapsed state. Default is FALSE.

- direction:

  Layout direction for controls within the panel. Either "row" or
  "column". Default is "column".

- custom_controls:

  List of custom controls to add initially. Each should be a list with
  elements: html, id (optional), title (optional).

## Value

The map or map proxy object for chaining.

## Examples

``` r
if (FALSE) { # \dontrun{
map() |>
 add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
 add_cursor_coords_control(panel_id = "my_panel") |>
 add_zoom_control(panel_id = "my_panel")

map() |>
 add_control_panel(
   panel_id = "my_panel",
   title = "Map Settings",
   position = "top-right",
   collapsible = TRUE,
   collapsed = TRUE,
   direction = "row"
 ) |>
 add_cursor_coords_control(panel_id = "my_panel", section_title = "Cursor Coordinates")
} # }
```
