# Add a route to a toro map

Add a route to a toro map

## Usage

``` r
add_route(map, route_id, points, settings = list())
```

## Arguments

- map:

  A toro map object or a map proxy object

- route_id:

  A unique identifier for the route

- points:

  A sf object containing the points of the route

- settings:

  A list of settings for the route (e.g., color, weight)

## Value

The updated map object

## Examples

``` r
if (FALSE) { # \dontrun{
library(shiny)
library(toro)
library(sf)

line_data <- sf::st_sf(
  id = 1,
  geometry = sf::st_sfc(
    sf::st_linestring(
      cbind(c(172.2041, 163.9383), c(-32.56960, -46.43999))
    ),
    crs = 4326
  )
)

ui <- fluidPage(
 tagList(
   mapOutput("map"),
   actionButton("play_route", "Play Route Animation"),
   actionButton("pause_route", "Pause Route Animation"),
   actionButton("remove_route", "Remove Route")
 )
)
server <- function(input, output, session) {
 output$map <- renderMap({
   map() |>
     add_route(route_id = "route_line", points = line_data)
 })

 observe({
   req(input$map_loaded)
   mapProxy("map") |>
     play_route(route_id = "route_line")
 }) |>
   bindEvent(input$play_route)

  observe({
   req(input$map_loaded)
   mapProxy("map") |>
     pause_route(route_id = "route_line")
 }) |>
   bindEvent(input$pause_route)

  observe({
   req(input$map_loaded)
   mapProxy("map") |>
     remove_route(route_id = "route_line")
 }) |>
   bindEvent(input$remove_route)
}
} # }
```
