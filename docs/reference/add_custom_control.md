# Add a custom HTML control to the map

Add a custom HTML control to the map

## Usage

``` r
add_custom_control(
  map,
  id,
  html,
  position = "top-right",
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
)
```

## Arguments

- map:

  The map or map proxy object.

- id:

  The ID for the custom control.

- html:

  The HTML content to add as a control.

- position:

  The position of the control on the map. Default is `"top-right"`.
  Options include "top-left", "top-right", "bottom-left",
  "bottom-right".

- panel_id:

  ID of control panel to add to (optional).

- section_title:

  Section title when added to a control panel.

- group_id:

  ID of control group to add to (optional).

## Value

The map or map proxy object for chaining.

## Examples

``` r
# Add to a map
map() |>
 add_custom_control(
   id = "custom_control",
   html = "<p>I am a custom control</p>"
)

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"customControls":[{"type":"custom","controlId":"custom_control","html":"<p>I am a custom control<\/p>","position":"top-right","panelId":null,"panelTitle":null,"groupId":null}],"controls":[{"type":"custom","controlId":"custom_control","html":"<p>I am a custom control<\/p>","position":"top-right","panelId":null,"panelTitle":null,"groupId":null}]},"evals":[],"jsHooks":[]}
# Add to a control panel
map() |>
 add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
 add_custom_control(
   id = "custom_control_panel",
   html = "<p>I am a custom control in a panel</p>",
   panel_id = "my_panel",
   section_title = "Custom Control Section"
 )

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"controlPanels":{"my_panel":{"panelId":"my_panel","options":{"title":"Map Settings","position":"bottom-left","collapsible":false,"collapsed":false,"direction":"column","customControls":null}}},"customControls":[{"type":"custom","controlId":"custom_control_panel","html":"<p>I am a custom control in a panel<\/p>","position":"top-right","panelId":"my_panel","panelTitle":"Custom Control Section","groupId":null}],"controls":[{"type":"custom","controlId":"custom_control_panel","html":"<p>I am a custom control in a panel<\/p>","position":"top-right","panelId":"my_panel","panelTitle":"Custom Control Section","groupId":null}]},"evals":[],"jsHooks":[]}
# Add to a control panel inside a control group
map() |>
 add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
 add_control_group(
   panel_id = "my_panel",
   group_id = "custom_controls",
   group_title = "Custom Controls"
   ) |>
 add_custom_control(
   id = "custom_control_panel",
   html = "<p>I am a custom control in a panel</p>",
   panel_id = "my_panel",
   group_id = "custom_controls"
 )

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"controlPanels":{"my_panel":{"panelId":"my_panel","options":{"title":"Map Settings","position":"bottom-left","collapsible":false,"collapsed":false,"direction":"column","customControls":null,"panelControls":[{"type":"group","groupId":"custom_controls","groupTitle":"Custom Controls","collapsible":false,"collapsed":false}]}}},"customControls":[{"type":"custom","controlId":"custom_control_panel","html":"<p>I am a custom control in a panel<\/p>","position":"top-right","panelId":"my_panel","panelTitle":null,"groupId":"custom_controls"}],"controls":[{"type":"custom","controlId":"custom_control_panel","html":"<p>I am a custom control in a panel<\/p>","position":"top-right","panelId":"my_panel","panelTitle":null,"groupId":"custom_controls"}]},"evals":[],"jsHooks":[]}
```
