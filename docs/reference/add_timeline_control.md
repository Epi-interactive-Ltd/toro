# Add a timeline control to the map or control panel

Add a timeline control to the map or control panel

## Usage

``` r
add_timeline_control(
  map,
  start_date = NULL,
  end_date = NULL,
  position = "bottom-left",
  max_ticks = 3,
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
)
```

## Arguments

- map:

  The map or map proxy object

- start_date:

  Start date for the timeline (YYYY-MM-DD format)

- end_date:

  End date for the timeline (YYYY-MM-DD format)

- position:

  Position on the map if not using a control panel. Default is
  "bottom-left"

- max_ticks:

  Maximum number of labeled ticks to prevent overlap. Default is 3

- panel_id:

  ID of control panel to add to (optional)

- section_title:

  Section title when added to a control panel

- group_id:

  Optional ID of the group to add the control to within a panel

## Value

The map or map proxy object for chaining

## Examples

``` r
if (FALSE) { # \dontrun{
# Add to a map (no dates specified)
map() |>
 add_timeline_control()

# Add to map with dates
map() |>
 add_timeline_control(
   start_date = Sys.Date(),
   end_date = Sys.Date() + 30
 )

# Add to a control panel
map() |>
 add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
 add_timeline_control(
   start_date = Sys.Date(),
   end_date = Sys.Date() + 30,
   panel_id = "my_panel"
 )

# Add to a control panel inside a control group
map() |>
 add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
 add_control_group(
   panel_id = "my_panel",
   group_id = "animation_controls",
   group_title = "Animation Controls"
 ) |>
 add_timeline_control(
   start_date = Sys.Date(),
   end_date = Sys.Date() + 30,
   panel_id = "my_panel",
   group_id = "animation_controls"
 )
} # }
```
