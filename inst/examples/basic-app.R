library(shiny)
library(toro)

ui <- fluidPage(
  toro::mapOutput("map")
)

server <- function(input, output, session) {
  output$map <- toro::renderMap({
    toro::map()
  })
}

if (interactive()) {
  shinyApp(ui, server)
}
