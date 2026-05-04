# Remove a cluster toggle control from the map

Remove a cluster toggle control from the map

## Usage

``` r
remove_cluster_toggle(proxy, layer_id, panel_id = NULL)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- layer_id:

  The ID of the layer whose cluster toggle control to remove.

- panel_id:

  Optional. If provided, removes the control from the specified control
  panel.

## Value

The map proxy object for chaining.

## Examples

``` r
if(interactive()){
# Load libraries
library(shiny)
library(toro)
library(sf)

# Prepare data
data(quakes)
quakes_data <- quakes |>
 sf::st_as_sf(coords = c("long", "lat"), crs = 4326)

ui <- fluidPage(
 tagList(
   mapOutput("map"),
   actionButton("remove_control", "Remove cluster control")
 )
)
server <- function(input, output, session) {
 output$map <- renderMap({
   add_symbol_layer(
     id = "quakes",
     source = quakes_data,
     can_cluster = TRUE
   ) |>
   add_cluster_toggle(layer_id = "quakes")
 })

 observe({
   req(input$map_loaded)
   mapProxy("map") |>
     remove_cluster_toggle("quakes")
 }) |>
   bindEvent(input$remove_control)
}
}
```
