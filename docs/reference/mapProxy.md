# Create a proxy object for updating the map

Create a proxy object for updating the map

## Usage

``` r
mapProxy(outputId, session = shiny::getDefaultReactiveDomain())
```

## Arguments

- outputId:

  The ID of the output element.

- session:

  The Shiny session object (default is the current session).

## Value

A proxy object for the map.

## Examples

``` r
if(interactive()){
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
}
```
