# Set the tile layer for the map

Set the tile layer for the map

## Usage

``` r
set_tile_layer(map, tiles)
```

## Arguments

- map:

  The map or map proxy object.

- tiles:

  A character vector of tile layer names. Options include values
  returned from
  [`get_tile_options()`](https://epi-interactive-ltd.github.io/toro/reference/get_tile_options.md).

## Value

The map or map proxy object for chaining.

## See also

[`get_tile_options()`](https://epi-interactive-ltd.github.io/toro/reference/get_tile_options.md)
for retrieving all tile options.

## Examples

``` r
if(interactive()){
library(shiny)
library(toro)

all_tiles <- get_tile_options()

ui <- fluidPage(
 tagList(
   mapOutput("map"),
   selectInput("tile_layer", "Select Tile Layer", choices = all_tiles)
 )
)
server <- function(input, output, session) {
 output$map <- renderMap({
   map(loadedTiles = all_tiles)
 })

 observe({
   mapProxy("map") |>
     set_tile_layer(tiles = input$tile_layer)
 }) |>
   bindEvent(input$tile_layer)
}
}
```
