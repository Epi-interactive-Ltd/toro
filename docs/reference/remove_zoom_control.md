# Remove the zoom control from the map.

Remove the zoom control from the map.

## Usage

``` r
remove_zoom_control(proxy, panel_id = NULL)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- panel_id:

  Optional. If provided, removes the zoom control from the specified
  control panel. If NULL, removes the standalone zoom control.

## Value

The map proxy object for chaining.

## Examples

``` r
if (FALSE) { # \dontrun{
library(shiny)
library(toro)

ui <- fluidPage(
 tagList(
   mapOutput("map"),
   checkboxInput("has_zoom_controls", "Remove Zoom Controls", value = TRUE)
 )
)
server <- function(input, output, session) {
 output$map <- renderMap({
   map() |>
     add_zoom_control()
 })

 observe({
   req(input$map_loaded)
   if (input$has_zoom_controls == TRUE) {
     mapProxy("map") |>
       add_zoom_control()
   } else {
     mapProxy("map") |>
       remove_zoom_control()
   }
 }) |>
   bindEvent(input$has_zoom_controls)
}
} # }
```
