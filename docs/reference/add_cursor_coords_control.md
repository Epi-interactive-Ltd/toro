# Add a cursor coordinates control to the map

Add a cursor coordinates control to the map

## Usage

``` r
add_cursor_coords_control(
  map,
  position = "bottom-left",
  long_label = "Lng",
  lat_label = "Lat",
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
)
```

## Arguments

- map:

  The map or map proxy object.

- position:

  The position of the cursor coordinates control on the map. Default is
  `"bottom-left"`. Options include "top-left", "top-right",
  "bottom-left", "bottom-right".

- long_label:

  The label for the longitude coordinate. Default is `"Lng"`.

- lat_label:

  The label for the latitude coordinate. Default is `"Lat"`.

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
 add_cursor_coords_control()

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"cursorControls":{"type":"cursor","position":"bottom-left","longLabel":"Lng","latLabel":"Lat","panelId":null,"panelTitle":null,"groupId":null},"controls":[{"type":"cursor","position":"bottom-left","longLabel":"Lng","latLabel":"Lat","panelId":null,"panelTitle":null,"groupId":null}]},"evals":[],"jsHooks":[]}
# Change default options
map() |>
 add_cursor_coords_control(
   position = "top-right",
   long_label = "Longitude",
   lat_label = "Latitude"
 )

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"cursorControls":{"type":"cursor","position":"top-right","longLabel":"Longitude","latLabel":"Latitude","panelId":null,"panelTitle":null,"groupId":null},"controls":[{"type":"cursor","position":"top-right","longLabel":"Longitude","latLabel":"Latitude","panelId":null,"panelTitle":null,"groupId":null}]},"evals":[],"jsHooks":[]}
# Add to a control panel
map() |>
 add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
 add_cursor_coords_control(panel_id = "my_panel", section_title = "Cursor Coordinates")

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"controlPanels":{"my_panel":{"panelId":"my_panel","options":{"title":"Map Settings","position":"bottom-left","collapsible":false,"collapsed":false,"direction":"column","customControls":null}}},"cursorControls":{"type":"cursor","position":"bottom-left","longLabel":"Lng","latLabel":"Lat","panelId":"my_panel","panelTitle":"Cursor Coordinates","groupId":null},"controls":[{"type":"cursor","position":"bottom-left","longLabel":"Lng","latLabel":"Lat","panelId":"my_panel","panelTitle":"Cursor Coordinates","groupId":null}]},"evals":[],"jsHooks":[]}
# Add to a control panel inside a control group
map() |>
 add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
 add_control_group(
   panel_id = "my_panel",
   group_id = "map_state",
   group_title = "Map State"
   ) |>
 add_cursor_coords_control(panel_id = "my_panel", group_id = "map_state")

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"controlPanels":{"my_panel":{"panelId":"my_panel","options":{"title":"Map Settings","position":"bottom-left","collapsible":false,"collapsed":false,"direction":"column","customControls":null,"panelControls":[{"type":"group","groupId":"map_state","groupTitle":"Map State","collapsible":false,"collapsed":false}]}}},"cursorControls":{"type":"cursor","position":"bottom-left","longLabel":"Lng","latLabel":"Lat","panelId":"my_panel","panelTitle":null,"groupId":"map_state"},"controls":[{"type":"cursor","position":"bottom-left","longLabel":"Lng","latLabel":"Lat","panelId":"my_panel","panelTitle":null,"groupId":"map_state"}]},"evals":[],"jsHooks":[]}
```
