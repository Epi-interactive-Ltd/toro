# Add a speed control to the map or control panel

The speed control allows users to adjust the speed of an animation on
the map, such as a time-based animation controlled by the timeline
control. It can be added as a standalone control on the map or within a
control panel for better organization of multiple controls.

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

- group_id:

  Optional ID of the group to add the control to within a panel.

## Value

The map or map proxy object for chaining.

## Examples

``` r
# Add to a map (no dates specified)
map() |>
 add_speed_control()

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"speedControls":{"standalone_speed":{"values":[0.5,1,2],"labels":["Slow","Normal","Fast"],"defaultIndex":1,"position":"top-right","useControlPanel":false,"panelId":null,"panelTitle":null,"groupId":null}}},"evals":[],"jsHooks":[]}
# Change default options
map() |>
 add_speed_control(
   values = c(0.5, 1, 2, 5),
   labels = c("Slow", "Normal", "Fast", "Super fast"),
   default_index = 4 # Start on Super fast
 )

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"speedControls":{"standalone_speed":{"values":[0.5,1,2,5],"labels":["Slow","Normal","Fast","Super fast"],"defaultIndex":3,"position":"top-right","useControlPanel":false,"panelId":null,"panelTitle":null,"groupId":null}}},"evals":[],"jsHooks":[]}
# Add to a control panel
map() |>
 add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
 add_speed_control(panel_id = "my_panel")

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"controlPanels":{"my_panel":{"panelId":"my_panel","options":{"title":"Map Settings","position":"bottom-left","collapsible":false,"collapsed":false,"direction":"column","customControls":null}}},"speedControls":{"my_panel_speed":{"values":[0.5,1,2],"labels":["Slow","Normal","Fast"],"defaultIndex":1,"position":"top-right","useControlPanel":true,"panelId":"my_panel","panelTitle":null,"groupId":null}}},"evals":[],"jsHooks":[]}
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

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"controlPanels":{"my_panel":{"panelId":"my_panel","options":{"title":"Map Settings","position":"bottom-left","collapsible":false,"collapsed":false,"direction":"column","customControls":null,"panelControls":[{"type":"group","groupId":"animation_controls","groupTitle":"Animation Controls","collapsible":false,"collapsed":false}]}}},"speedControls":{"my_panel_speed":{"values":[0.5,1,2],"labels":["Slow","Normal","Fast"],"defaultIndex":1,"position":"top-right","useControlPanel":true,"panelId":"my_panel","panelTitle":null,"groupId":"animation_controls"}}},"evals":[],"jsHooks":[]}
```
