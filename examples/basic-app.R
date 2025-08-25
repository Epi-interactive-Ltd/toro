library(shiny)
library(maplibReGL)

ui <- fluidPage(
  theme = bslib::bs_theme(version = 5),
  shinyjs::useShinyjs(),
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
