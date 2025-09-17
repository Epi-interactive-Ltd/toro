library(shiny)
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
