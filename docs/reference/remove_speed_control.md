# Remove the speed control from the map.

Remove the speed control from the map.

## Usage

``` r
remove_speed_control(proxy, panel_id = NULL)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- panel_id:

  Optional. If provided, removes the speed control from the specified
  control panel. If NULL, removes the standalone speed control.

## Value

The map proxy object for chaining.

## Examples

``` r
if (FALSE) { # \dontrun{
# Add to a map
map() |>
 add_speed_control()
# In an observer
mapProxy("map") |>
 remove_speed_control()

# Add to a control panel
map() |>
 add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
 add_speed_control(panel_id = "my_panel")
# In an observer
mapProxy("map") |>
 remove_speed_control(panel_id = "my_panel")
} # }
```
