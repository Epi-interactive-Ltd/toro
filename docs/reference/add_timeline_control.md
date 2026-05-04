# Add a timeline control to the map or control panel

The timeline control allows for users to interact with a date-based
timeline, and can be used to control an animation of map data over time.

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

  The map or map proxy object.

- start_date:

  Start date for the timeline (YYYY-MM-DD format).

- end_date:

  End date for the timeline (YYYY-MM-DD format).

- position:

  Position on the map if not using a control panel. Default is
  "bottom-left".

- max_ticks:

  Maximum number of labeled ticks to prevent overlap. Default is 3.

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
 add_timeline_control()

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"timelineControls":{"standalone_timeline":{"startDate":[],"endDate":[],"position":"bottom-left","maxTicks":3,"useControlPanel":false,"panelId":null,"panelTitle":null,"groupId":null}}},"evals":[],"jsHooks":[]}
# Add to map with dates
map() |>
 add_timeline_control(
   start_date = Sys.Date(),
   end_date = Sys.Date() + 30
 )

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"timelineControls":{"standalone_timeline":{"startDate":"2026-05-05","endDate":"2026-06-04","position":"bottom-left","maxTicks":3,"useControlPanel":false,"panelId":null,"panelTitle":null,"groupId":null}}},"evals":[],"jsHooks":[]}
# Add to a control panel
map() |>
 add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
 add_timeline_control(
   start_date = Sys.Date(),
   end_date = Sys.Date() + 30,
   panel_id = "my_panel"
 )

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"controlPanels":{"my_panel":{"panelId":"my_panel","options":{"title":"Map Settings","position":"bottom-left","collapsible":false,"collapsed":false,"direction":"column","customControls":null}}},"timelineControls":{"my_panel_timeline":{"startDate":"2026-05-05","endDate":"2026-06-04","position":"bottom-left","maxTicks":3,"useControlPanel":true,"panelId":"my_panel","panelTitle":null,"groupId":null}}},"evals":[],"jsHooks":[]}
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

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"controlPanels":{"my_panel":{"panelId":"my_panel","options":{"title":"Map Settings","position":"bottom-left","collapsible":false,"collapsed":false,"direction":"column","customControls":null,"panelControls":[{"type":"group","groupId":"animation_controls","groupTitle":"Animation Controls","collapsible":false,"collapsed":false}]}}},"timelineControls":{"my_panel_timeline":{"startDate":"2026-05-05","endDate":"2026-06-04","position":"bottom-left","maxTicks":3,"useControlPanel":true,"panelId":"my_panel","panelTitle":null,"groupId":"animation_controls"}}},"evals":[],"jsHooks":[]}
```
