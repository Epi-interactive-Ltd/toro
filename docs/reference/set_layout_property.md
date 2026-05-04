# Set a layout property for a layer on the map

Set a layout property for a layer on the map

## Usage

``` r
set_layout_property(proxy, layer_id, property_name, value)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- layer_id:

  The ID of the layer to update.

- property_name:

  The name of the layout property to set.

- value:

  The value to set for the layout property.

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
     "text_column",
     "Select Text Column",
     choices = c("depth", "mag", "stations")
   )
 )
)
server <- function(input, output, session) {
 output$map <- renderMap({
   map() |>
     add_text_layer(
       id = "quakes",
       source = quakes_data,
       layout = get_layout_options(
         "text",
         options = list(
           text_field = get_column("depth")
         )
       )
     )
 })

 observe({
   req(input$map_loaded)
   mapProxy("map") |>
     set_layout_property(
       layer_id = "quakes",
       property_name = "text-field",
       value = get_column(input$text_column)
     )
 }) |>
   bindEvent(input$text_column)
}
}
```
