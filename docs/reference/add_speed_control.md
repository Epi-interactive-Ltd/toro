# Add a speed control to the map or control panel

Add a speed control to the map or control panel

## Usage

``` r
add_speed_control(
  map,
  values = c(0.5, 1, 2),
  labels = c("Slow", "Normal", "Fast"),
  default_index = 2,
  position = "top-right",
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
)
```

## Arguments

- map:

  The map or map proxy object.

- values:

  Vector of speed multiplier values. Default is c(0.5, 1, 2).

- labels:

  Vector of labels for each speed value. Default is c("Slow", "Normal",
  "Fast").

- default_index:

  Index of the default speed (1-based). Default is 2.

- position:

  Position on the map if not using a control panel. Default is
  "top-right".

- panel_id:

  ID of control panel to add to (optional).

- section_title:

  Section title when added to a control panel.

## Value

             The map or map proxy object for chaining.

## Examples

``` r
if (interactive()) {
# Add to a map (no dates specified)
map() |>
 add_speed_control()

# Change default options
map() |>
 add_speed_control(
   values = c(0.5, 1, 2, 5),
   labels = c("Slow", "Normal", "Fast", "Super fast"),
   default_index = 4 # Start on Super fast
 )

# Add to a control panel
map() |>
 add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
 add_speed_control(panel_id = "my_panel")

# Add to a control panel inside a control group
map() |>
 add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
 add_control_group(
   panel_id = "my_panel",
   group_id = "animation_controls",
   group_title = "Animation Controls"
 ) |>
 add_speed_control(
   panel_id = "my_panel",
   group_id = "animation_controls"
 )
}
```
