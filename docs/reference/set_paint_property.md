# Set a paint property for a layer on the map

Set a paint property for a layer on the map

## Usage

``` r
set_paint_property(proxy, layer_id, property_name, value)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- layer_id:

  The ID of the layer to update.

- property_name:

  The name of the paint property to set.

- value:

  The value to set for the paint property.

## Value

The map proxy object for chaining.

## Examples

``` r
if(interactive()){
library(shiny)
library(sf)
library(toro)

data(quakes)
quakes_data <- sf::st_as_sf(quakes, coords = c("long", "lat"), crs = 4326)

ui <- fluidPage(
 tagList(
   mapOutput("map"),
   selectInput(
     "colour",
     "Select Tile Layer",
     choices = c(
       "red",
       "orange",
       "yellow",
       "green",
       "blue",
       "indigo",
       "violet"
     )
   )
 )
)
server <- function(input, output, session) {
 output$map <- renderMap({
   map() |>
     add_circle_layer(id = "quakes", source = quakes_data)
 })

 observe({
   req(input$map_loaded)
   mapProxy("map") |>
     set_paint_property(
       layer_id = "quakes",
       property_name = "circle-color",
       value = input$colour
     )
 }) |>
   bindEvent(input$colour)
}
}
```
