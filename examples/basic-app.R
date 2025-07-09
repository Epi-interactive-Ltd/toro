library(shiny)
library(maplibReGL)

ui <- fluidPage(
  theme = bslib::bs_theme(version = 5),
  shinyjs::useShinyjs(),
  tags$head(
    maplibReGL::addMaplibreDependencies()
  ),
  maplibReGL::mapOutput("map")
)

server <- function(input, output, session) {
  map <- maplibReGL::map(elementId = "map")

  output$map <- maplibReGL::renderMap({
    map$ui()
  })
}

if (interactive()) {
  shinyApp(ui, server)
}
