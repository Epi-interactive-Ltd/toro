# Remove the cursor coordinates control from the map

Remove the cursor coordinates control from the map

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
  specified control panel. If `NULL`, removes the standalone cursor
  coordinates control.

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
     add_cursor_coords_control()
 })

 output$map_two <- renderMap({
   map() |>
     add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
     add_cursor_coords_control(panel_id = "my_panel")
 })

 observe({
   req(input$map_one_loaded, input$map_two_loaded)
   mapProxy("map_one") |>
     remove_cursor_coords_control()
   mapProxy("map_two") |>
     remove_cursor_coords_control(panel_id = "my_panel")
 }) |>
   bindEvent(input$remove_control)
}
}
```
