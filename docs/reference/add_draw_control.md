# Functions related to the draw control.

Functions:

- add_draw_control: Add a draw control to the map.

- remove_draw_control: Remove the draw control from the map.

- delete_drawn_shape: Delete a drawn shape from the map. Add a draw
  control to the map

## Usage

``` r
add_draw_control(
  map,
  id = "draw_control",
  position = "top-right",
  modes = c("polygon", "trash"),
  active_colour = "#0FB3CE",
  inactive_colour = "#0FB3CE",
  mode_labels = list(),
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
)
```

## Arguments

- map:

  The map or map proxy object.

- id:

  The ID for the draw control.

- position:

  The position of the draw control on the map. Default is `"top-right"`.
  Options are "top-left", "top-right", "bottom-left", "bottom-right".

- modes:

  A vector of modes to enable in the draw control. Default is
  `c("polygon", "trash")`. Options include "polygon", "trash", "line".

- active_colour:

  The colour for the drawn shapes. Default is `"#0FB3CE"`.

- inactive_colour:

  The colour for the inactive shapes. Default is `"#0FB3CE"`.

- mode_labels:

  A named list of labels for each mode. For example,
  `list(polygon = "Draw Polygon", trash = "Delete Shape")`.

- panel_id:

  ID of control panel to add to (optional).

- section_title:

  Section title when added to a control panel.

## Value

               The map or map proxy object for chaining.
