# Remove the cursor coordinates control from the map.

Remove the cursor coordinates control from the map.

## Usage

``` r
remove_cursor_coords_control(proxy, panel_id = NULL)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- panel_id:

  Optional. If provided, removes the cursor coordinates control from the
  specified control panel. If NULL, removes the standalone cursor
  coordinates control.

## Value

         The map proxy object for chaining.

## Examples

``` r
if (interactive()) {
# Add to a map
map() |>
 add_cursor_coords_control()
# In an observer
mapProxy("map") |>
 remove_cursor_coords_control()

# Add to a control panel
map() |>
 add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
 add_cursor_coords_control(panel_id = "my_panel")
# In an observer
mapProxy("map") |>
 remove_cursor_coords_control(panel_id = "my_panel")
}
```
