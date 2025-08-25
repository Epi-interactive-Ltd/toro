library(shiny)
library(maplibReGL)


ui <- fluidPage(
  theme = bslib::bs_theme(version = 5),
  shinyjs::useShinyjs(),
  maplibReGL::mapOutput("map"),
  selectInput(
    "tiles",
    "Tiles",
    choices = maplibReGL::get_tile_options(),
    selected = "satellite"
  ),
)

server <- function(input, output, session) {
  output$map <- maplibReGL::renderMap({
    maplibReGL::map(style = "satellite", loadedTiles = maplibReGL::get_tile_options())
  })

  observe({
    req(input$tiles)
    maplibReGL::mapProxy("map") |>
      set_tile_layer(input$tiles)
  })
}

if (interactive()) {
  shinyApp(ui, server)
}
