library(shiny)
library(maplibReGL)

ui <- fluidPage(
  maplibReGL::mapOutput("map")
)

server <- function(input, output, session) {
  output$map <- maplibReGL::renderMap({
    maplibReGL::map()
  })
}

if (interactive()) {
  shinyApp(ui, server)
}
