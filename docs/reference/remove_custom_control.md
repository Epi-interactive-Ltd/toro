# Remove a custom control from the map.

Remove a custom control from the map.

## Usage

``` r
remove_custom_control(proxy, control_id, panel_id = NULL)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- control_id:

  The ID of the custom control to remove.

- panel_id:

  Optional. If provided, removes the control from the specified control
  panel. If NULL, removes the standalone custom control.

## Value

The map proxy object for chaining.

## Examples

``` r
if (FALSE) { # \dontrun{
# Add to a map
map() |>
 add_custom_control(
   id = "custom_control",
   html = "<p>I am a custom control</p>"
)
# In an observer
mapProxy("map") |>
 remove_custom_control("custom_control")

# Add to a control panel
map() |>
 add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
 add_custom_control(
   id = "custom_control_panel",
   html = "<p>I am a custom control in a panel</p>",
   panel_id = "my_panel"
 )
# In an observer
mapProxy("map") |>
 remove_custom_control("custom_control", panel_id = "my_panel")
} # }
```
