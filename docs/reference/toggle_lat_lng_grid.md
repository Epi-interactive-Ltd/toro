# Show/hide the latitude and longitude grid on the map.

Show/hide the latitude and longitude grid on the map.

## Usage

``` r
toggle_lat_lng_grid(proxy, show = TRUE)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- show:

  Logical indicating whether to show or hide the grid. Default is
  `TRUE`.

## Value

The map proxy object for chaining.

## Examples

``` r
if (FALSE) { # \dontrun{
library(shiny)
library(toro)

ui <- fluidPage(
 tagList(
   mapOutput("map"),
   actionButton("show_grid", "Show Grid"),
   actionButton("hide_grid", "Hide Grid")
 )
)
server <- function(input, output, session) {

 output$map <- renderMap({
   map() |>
     add_lat_lng_grid()
  })

  observe({
    mapProxy("map") |>
      toggle_lat_lng_grid(show = TRUE)
  }) |>
    bindEvent(input$show_grid)

  observe({
    mapProxy("map") |>
      toggle_lat_lng_grid(show = FALSE)
   }) |>
     bindEvent(input$hide_grid)
}
} # }
```
