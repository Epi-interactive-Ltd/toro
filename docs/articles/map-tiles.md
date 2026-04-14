# Map Tiles

You can find the tile options by using
[`get_tile_options()`](https://epi-interactive-ltd.github.io/toro/reference/get_tile_options.md).

``` r

get_tile_options()
```

\[1\] “natgeo” “satellite” “topo” “terrain” “streets” “shaded”\
\[7\] “lightgrey”

When declaring a map, you can specify the style and any tiles you want
the map to start with by using the `style` parameter.

By default, the `style` is set to `lightgrey`, but you can change it to
any of the options available.

``` r

map(style="satellite")
```

If you want the ability for the map to change tiles you need to set the
`loadedTiles` parameter to a vector of the tiles you want to be able to
switch between.

``` r

map(
  style="satellite",
  loadedTiles = c("satellite", "lightgrey", "natgeo")
)
```

You can also supply options for each tile set.

> **Note**: `loadedTiles` either needs to be a character vector (like
> above) or a names list (like below). These two cannot be combined. If
> you do not want to supply options for a certain tile set just make it
> an empty list.

> **Note**: Currently the only option supported in `maxZoom` but more
> will be added in the future.

``` r

map(
  style="satellite",
  loadedTiles = list(
    satellite = list(
      maxZoom = 19
    ),
    lightgrey = list(),
    natgeo = list(
      maxZoom = 16
    )
  )
)
```

## Changing Tiles

### set_tile_layer()

You can use the
[`set_tile_layer()`](https://epi-interactive-ltd.github.io/toro/reference/set_tile_layer.md)
function to update the tiles on the map to any of the options defined in
`loadedTiles` when the map was created.

``` r

library(shiny)
#> Warning: package 'shiny' was built under R version 4.5.2
library(toro)


ui <- fluidPage(
  toro::mapOutput("map"),
  selectInput(
    "tiles",
    "Tiles",
    choices = toro::get_tile_options(),
    selected = "satellite"
  ),
)

server <- function(input, output, session) {
  output$map <- toro::renderMap({
    toro::map(style = "satellite", loadedTiles = toro::get_tile_options())
  })

  observe({
    req(input$tiles)
    toro::mapProxy("map") |>
      set_tile_layer(input$tiles)
  })
}

if (interactive()) {
  shinyApp(ui, server)
}
```

### Tile Controllers

You can also change a maps tiles via a tile controller. A tile
controller must be placed inside a control panel.

For more information on adding controls to a map see the [controls
vignette](https://epi-interactive-ltd.github.io/toro/articles/controls.html).

``` r

library(shiny)
library(toro)

all_tiles <- toro::get_tile_options()

ui <- fluidPage(
  toro::mapOutput("map")
)

server <- function(input, output, session) {
  output$map <- toro::renderMap({
    toro::map(style = "satellite", loadedTiles = all_tiles) |>
      add_control_panel(
        panel_id = "demo-panel"
      ) |>
      add_tile_selector_control(
        available_tiles = all_tiles,
        panel_id = "demo-panel"
      )
  })

}

if (interactive()) {
  shinyApp(ui, server)
}
```
