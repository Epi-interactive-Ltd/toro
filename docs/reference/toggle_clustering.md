# Toggle clustering for a layer on the map.

Toggle clustering for a layer on the map.

## Usage

``` r
toggle_clustering(proxy, layer_id, cluster = FALSE)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- layer_id:

  The ID of the layer to toggle clustering for.

- cluster:

  Whether to enable clustering. Default is `FALSE`.

## Value

The map proxy object for chaining.

## Examples

``` r
if (FALSE) { # \dontrun{
library(shiny)
library(sf)
library(toro)

data(quakes)
quakes_data <- sf::st_as_sf(quakes, coords = c("long", "lat"), crs = 4326)

ui <- fluidPage(
 tagList(
   mapOutput("map"),
   checkboxInput("toggle_cluster", "Toggle Clustering", value = TRUE)
 )
)
server <- function(input, output, session) {
 output$map <- renderMap({
   map() |>
     add_symbol_layer(
       id = "quakes",
       source = quakes_data,
       can_cluster = TRUE
     )
 })

 observe({
   mapProxy("map") |>
     toggle_clustering(layer_id = "quakes", cluster = input$toggle_cluster)
 }) |>
   bindEvent(input$toggle_cluster)
}
} # }
```
