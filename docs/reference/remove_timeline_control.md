# Remove the timeline control from the map

Remove the timeline control from the map

## Usage

``` r
remove_timeline_control(proxy, panel_id = NULL)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- panel_id:

  Optional. If provided, removes the timeline control from the specified
  control panel. If NULL, removes the standalone timeline control.

## Value

The map proxy object for chaining.

## Examples

``` r
# Add to a map
map() |>
 add_timeline_control()

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"timelineControls":{"standalone_timeline":{"startDate":[],"endDate":[],"position":"bottom-left","maxTicks":3,"useControlPanel":false,"panelId":null,"panelTitle":null,"groupId":null}}},"evals":[],"jsHooks":[]}
# Add to a control panel
map() |>
 add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
 add_timeline_control(panel_id = "my_panel")

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"controlPanels":{"my_panel":{"panelId":"my_panel","options":{"title":"Map Settings","position":"bottom-left","collapsible":false,"collapsed":false,"direction":"column","customControls":null}}},"timelineControls":{"my_panel_timeline":{"startDate":[],"endDate":[],"position":"bottom-left","maxTicks":3,"useControlPanel":true,"panelId":"my_panel","panelTitle":null,"groupId":null}}},"evals":[],"jsHooks":[]}
```
