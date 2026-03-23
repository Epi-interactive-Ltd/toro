# Set data for a source on the map.

Set data for a source on the map.

## Usage

``` r
set_source_data(proxy, source_id, data, type = "geojson")
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- source_id:

  The ID of the source to update.

- data:

  The data for the source, typically in GeoJSON format.

- type:

  The type of the source. Default is `"geojson"`. Other options include
  `"vector"` or `"raster"`.

## Value

The map proxy object for chaining.

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
   actionButton("btn", "Update Source Data")
 )
)
server <- function(input, output, session) {
 get_random_points <- function(data, n = 10) {
   random_rows <- runif(n, min = 1, max = nrow(data))
   return(data[random_rows, ])
 }

 output$map <- renderMap({
   map() |>
     add_symbol_layer(
       id = "quakes",
       source = get_random_points(quakes_data)
     )
   })
 observe({
   mapProxy("map") |>
     set_source_data(
       source_id = "source-quakes",
       data = get_random_points(quakes_data)
     )
 }) |>
 bindEvent(input$btn)
}
} # }
```
