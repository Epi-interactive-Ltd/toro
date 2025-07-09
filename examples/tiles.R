library(shiny)
library(maplibReGL)

all_tiles <- c("natgeo", "satellite", "topo", "terrain", "streets", "shaded", "light-grey")

ui <- fluidPage(
  theme = bslib::bs_theme(version = 5),
  shinyjs::useShinyjs(),
  tags$head(
    maplibReGL::addMaplibreDependencies()
  ),
  maplibReGL::mapOutput("map"),
  selectInput("tiles", "Tiles", choices = all_tiles, selected = "satellite")
)

server <- function(input, output, session) {
  map <- maplibReGL::map(
    elementId = "map",
    props = list(
      loadedTiles = all_tiles,
      initialTileLayer = "satellite"
    )
  )

  output$map <- maplibReGL::renderMap({
    map$ui()
  })

  observe({
    req(input$tiles)
    map$set_tile_layer(input$tiles)
  })
}

if (interactive()) {
  shinyApp(ui, server)
}
