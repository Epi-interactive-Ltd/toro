# Remove a control from the map.

Remove a control from the map.

## Usage

``` r
remove_control(proxy, control_id)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- control_id:

  The ID of the control to remove.

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
 remove_control("zoom_control") |>
 remove_control("custom_control")
}
```
