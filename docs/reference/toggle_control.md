# Toggle the visibility of a control on the map

Toggle the visibility of a control on the map

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
if(interactive()){
library(shiny)
library(toro)

ui <- fluidPage(
 tagList(
   mapOutput("map"),
   checkboxInput("show_controls", "Show controls", value = TRUE)
 )
)
server <- function(input, output, session) {
 output$map <- renderMap({
   map() |>
     add_zoom_control() |>
     add_custom_control(
       id = "custom_control",
       html = "<p>I am a custom control</p>"
     )
 })

 observe({
   req(input$map_loaded)
   mapProxy("map") |>
     toggle_control("zoom_control", show = input$show_controls) |>
     toggle_control("custom_control", show = input$show_controls)
 }) |>
   bindEvent(input$show_controls)
}
}
```
