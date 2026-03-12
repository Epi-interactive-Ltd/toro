# Remove the timeline control from the map.

Remove the timeline control from the map.

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
if (interactive()) {
# Add to a map
map() |>
 add_timeline_control()
# In an observer
mapProxy("map") |>
 remove_timeline_control()

# Add to a control panel
map() |>
 add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
 add_timeline_control(panel_id = "my_panel")
# In an observer
mapProxy("map") |>
 remove_timeline_control(panel_id = "my_panel")
}
```
