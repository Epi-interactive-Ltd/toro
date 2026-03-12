# Add a control group to a control panel

Creates a collapsible group within a control panel that can contain
multiple controls.

## Usage

``` r
add_control_group(
  map,
  panel_id,
  group_id,
  group_title = NULL,
  collapsible = FALSE,
  collapsed = FALSE
)
```

## Arguments

- map:

  The map or map proxy object.

- panel_id:

  ID of the target control panel.

- group_id:

  Unique identifier for the control group.

- group_title:

  Title for the control group (optional).

- collapsible:

  Whether the group can be collapsed. Default is FALSE.

- collapsed:

  Initial collapsed state. Default is FALSE.

## Value

             The map or map proxy object for chaining.

## Examples

``` r
if (interactive()) {
map() |>
 add_control_panel(panel_id = "my_panel", direction = "row") |>
 add_control_group(
   panel_id = "my_panel",
   group_id = "group_1",
   group_title = "Group 1"
 ) |>
 add_control_group(
   panel_id = "my_panel",
   group_id = "group_2",
   group_title = "Group 2"
 ) |>
 add_cursor_coords_control(panel_id = "my_panel", group_id = "group_1") |>
 add_zoom_control(panel_id = "my_panel", group_id = "group_2")

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
}
```
