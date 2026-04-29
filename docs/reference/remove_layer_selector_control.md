# Remove the layer selector control from the map

Remove the layer selector control from the map

## Usage

``` r
remove_layer_selector_control(proxy, panel_id = NULL)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- panel_id:

  Optional. If provided, removes the layer selector control from the
  specified control panel. If `NULL`, removes the standalone layer
  selector control.

## Value

The map proxy object for chaining.

## Examples

``` r
if(interactive()){
# Load libraries
library(shiny)
library(toro)
library(spData)
library(sf)

# Prepare data
data(quakes)
quakes_data <- quakes |>
 sf::st_as_sf(coords = c("long", "lat"), crs = 4326)

nz_data <- spData::nz_height |>
  sf::st_transform(4326)

ui <- fluidPage(
 tagList(
   mapOutput("map"),
   actionButton("remove_control", "Remove layer selector control")
 )
)
server <- function(input, output, session) {
 output$map <- renderMap({
   map() |>
     add_circle_layer(
       id = "quakes",
       source = quakes_data
     ) |>
     add_circle_layer(
       id = "nz_elevation",
       source = nz_data
     ) |>
     add_layer_selector_control(
       layer_ids = c("quakes", "nz_elevation"),
       labels = c("quakes" = "Earthquakes", "nz_elevation" = "NZ Elevation")
     )
 })

 observe({
   req(input$map_loaded)
   mapProxy("map") |>
     remove_layer_selector_control()
 }) |>
   bindEvent(input$remove_control)
}
}
```
