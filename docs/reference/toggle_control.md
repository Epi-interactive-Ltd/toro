# Utilities for the map related to controls.

Functions:

- toggle_control: Toggle the visibility of a control on the map.

- remove_control: Remove a control from the map.

- add_custom_control: Add a custom HTML control to the map.

- remove_custom_control: Remove a custom control from the map.

- add_cursor_coords_control: Add a cursor coordinates control to the
  map.

- remove_cursor_coords_control: Remove the cursor coordinates control
  from the map. Toggle the visibility of a control on the map.

## Usage

``` r
toggle_control(proxy, control_id, show = TRUE)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- control_id:

  The ID of the control to toggle.

- show:

  Logical indicating whether to show or hide the control. Default is
  `TRUE`.

## Value

           The map proxy object for chaining.

## Examples

``` r
if (interactive()) {
# In a Shiny app:
output$map <- renderMap({
 map() |>
   add_zoom_control() |>
   add_custom_control(
     id = "custom_control",
     html = "<p>I am a custom control</p>"
   )
})

# In an observer:
mapProxy("map") |>
 toggle_control("zoom_control", show = FALSE) |>
 toggle_control("custom_control", show = FALSE)
}
```
