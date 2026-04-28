# Show a previously hidden layer on the map

Show a previously hidden layer on the map

## Usage

``` r
show_layer(proxy, layer_id)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md)

- layer_id:

  The ID of the layer to show

## Value

The map proxy object for chaining

## Examples

``` r
if (FALSE) { # \dontrun{
library(shiny)
library(sf)
library(toro)

data(quakes)
quakes_data <- st_as_sf(quakes, coords = c("long", "lat"), crs = 4326)

ui <- fluidPage(
 tagList(
   mapOutput("map"),
   actionButton("show_layer", "Show Layer"),
   actionButton("hide_layer", "Hide Layer")
 )
)
server <- function(input, output, session) {
 output$map <- renderMap({
   map() |>
     add_circle_layer(
       id = "quakes",
       source = quakes_data
     )
 })

 observe({
   mapProxy("map") |>
     show_layer(layer_id = "quakes")
 }) |>
   bindEvent(input$show_layer)

 observe({
   mapProxy("map") |>
     hide_layer(layer_id = "quakes")
 }) |>
   bindEvent(input$hide_layer)
}
} # }
```
