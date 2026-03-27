# Remove the tile selector control from the map.

Remove the tile selector control from the map.

## Usage

``` r
remove_tile_selector_control(proxy, panel_id = NULL)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- panel_id:

  Optional. If provided, removes the tile selector control from the
  specified control panel. If NULL, removes the standalone tile selector
  control.

## Value

The map proxy object for chaining.

## Examples

``` r
if (FALSE) { # \dontrun{
library(shiny)
library(toro)

all_tiles <- get_tile_options()

ui <- fluidPage(
 tagList(
   mapOutput("map"),
   actionButton("remove_control", "Remove tile selector control")
 )
)
server <- function(input, output, session) {
 output$map <- renderMap({
   map(loadedTiles = all_tiles) |>
     add_tile_selector_control(available_tiles = all_tiles)
 })

 observe({
   req(input$map_loaded)
   mapProxy("map") |>
     remove_tile_selector_control()
 }) |>
   bindEvent(input$remove_control)
}
} # }
```
