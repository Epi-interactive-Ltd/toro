# Add a draw control to the map

Add a draw control to the map

## Usage

``` r
add_draw_control(
  map,
  id = "draw_control",
  position = "top-right",
  modes = c("polygon"),
  active_colour = "#04AAC1",
  inactive_colour = "#04AAC1",
  mode_labels = list(),
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
)
```

## Arguments

- map:

  The map or map proxy object

- id:

  The ID for the draw control

- position:

  The position of the draw control on the map. Default is `"top-right"`.
  Options are "top-left", "top-right", "bottom-left", "bottom-right"

- modes:

  A vector of modes to enable in the draw control. Default is
  `c("polygon")`. Options include "polygon", "delete", "line", and
  "point"

- active_colour:

  The colour for the drawn shapes. Default is `"#04AAC1"`

- inactive_colour:

  The colour for the inactive shapes. Default is `"#04AAC1"`

- mode_labels:

  A named list of labels for each mode. For example,
  `list(polygon = "Draw Polygon", delete = "Delete Shape")`

- panel_id:

  ID of control panel to add to (optional)

- section_title:

  Section title when added to a control panel

- group_id:

  Optional group ID for grouping controls within a panel

## Value

The map or map proxy object for chaining

## Examples

``` r
if (FALSE) { # \dontrun{
map() |>
 add_draw_control()
} # }
```
