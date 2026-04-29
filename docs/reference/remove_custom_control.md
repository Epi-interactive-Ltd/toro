# Remove a custom control from the map

Remove a custom control from the map

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
  panel. If `NULL`, removes the standalone custom control.

## Value

The map proxy object for chaining.

## Examples

``` r
if(interactive()){
library(shiny)
library(toro)

ui <- fluidPage(
 tagList(
   fluidRow(
     column(6, mapOutput("map_one")),
     column(6, mapOutput("map_two"))
   ),
   actionButton("remove_control", "Remove control")
 )
)
server <- function(input, output, session) {
 output$map_one <- renderMap({
   map() |>
     add_custom_control(
       id = "custom_control",
       html = "<p>I am a custom control</p>"
     )
 })

 output$map_two <- renderMap({
   map() |>
     add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
     add_custom_control(
       id = "custom_control",
       html = "<p>I am a custom control</p>",
       panel_id = "my_panel"
     )
 })

 observe({
   req(input$map_one_loaded, input$map_two_loaded)
   mapProxy("map_one") |>
     remove_custom_control("custom_control")
   mapProxy("map_two") |>
     remove_custom_control("custom_control", panel_id = "my_panel")
 }) |>
   bindEvent(input$remove_control)
}
}
```
