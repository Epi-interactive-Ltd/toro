# Add a draw control to the map

The draw control allows users to draw shapes (polygons, lines, points)
on the map. The drawn shapes can be styled and managed through the
control options. Information about the drawn shapes can be retrieved in
Shiny using the `input$map_shape_created` (where `map` is the ID of the
map) reactive value.

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

  The map or map proxy object.

- id:

  The ID for the draw control.

- position:

  The position of the draw control on the map. Default is `"top-right"`.
  Options are "top-left", "top-right", "bottom-left", "bottom-right".

- modes:

  A vector of modes to enable in the draw control. Default is
  `c("polygon")`. Options include "polygon", "delete", "line", and
  "point".

- active_colour:

  The colour for the drawn shapes. Default is `"#04AAC1"`.

- inactive_colour:

  The colour for the inactive shapes. Default is `"#04AAC1"`.

- mode_labels:

  A named list of labels for each mode. For example,
  `list(polygon = "Draw Polygon", delete = "Delete Shape")`.

- panel_id:

  ID of control panel to add to (optional).

- section_title:

  Section title when added to a control panel.

- group_id:

  Optional group ID for grouping controls within a panel.

## Value

The map or map proxy object for chaining.

## Details

For a more in-depth example see the [Draw
control](https://epi-interactive-ltd.github.io/toro/articles/examples/controls/draw-control.html)
article.

## See also

[`get_drawn_shape()`](https://epi-interactive-ltd.github.io/toro/reference/get_drawn_shape.md)
to retrieve the drawn shape as an `sf` object in Shiny.

## Examples

``` r
map() |>
 add_draw_control()

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"drawControl":{"type":"draw","controlId":"draw_control","position":"top-right","modes":["polygon"],"activeColour":"#04AAC1","inactiveColour":"#04AAC1","modeLabels":[],"panelId":null,"panelTitle":null,"groupId":null},"controls":[{"type":"draw","controlId":"draw_control","position":"top-right","modes":["polygon"],"activeColour":"#04AAC1","inactiveColour":"#04AAC1","modeLabels":[],"panelId":null,"panelTitle":null,"groupId":null}]},"evals":[],"jsHooks":[]}
```
