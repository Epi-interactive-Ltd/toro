library(shiny)
library(dplyr)
library(sf)
library(maplibReGL)

ui <- fluidPage(
  theme = bslib::bs_theme(version = 5),
  shinyjs::useShinyjs(),
  tags$head(
    maplibReGL::addMaplibreDependencies()
  ),
  maplibReGL::mapOutput("map"),
  uiOutput("drawn_shapes")
)

server <- function(input, output, session) {
  map <- maplibReGL::map(
    elementId = "map"
  )

  shapes <- reactiveVal(sf::st_sf(
    data.frame(
      id = character()
    ),
    geometry = sf::st_sfc(),
    crs = 4326
  ))

  output$map <- maplibReGL::renderMap({
    map$ui()
  })

  output$drawn_shapes <- renderUI({
    div(
      h3("Drawn Shapes"),
      tags$ol(
        lapply(seq_len(nrow(shapes())), function(i) {
          tags$li(shapes()$id[i])
        })
      )
    )
  })

  observeEvent(input$map_loaded, {
    map$add_draw_control(
      position = "top-left",
      modes = c("polygon", "trash", "point"),
      inactive_colour = "#c41e12",
      mode_labels = list(
        polygon = as.character(span(
          "Drawn polygon",
          style = "padding: 0 5px; text-wrap: nowrap; margin: 0;"
        ))
      )
    )
    map$add_custom_control(
      html = "<div style='background: white; padding: 5px;'>I am a custom div</div>"
    )
    map$add_cursor_coords_control("bottom-left")
    map$add_lat_lng_grid()
    map$add_zoom_control()
  })

  observe({
    req(input$map_shape_created)
    new_shape <- maplibReGL::getDrawnShape(input$map_shape_created)

    shapes(rbind(shapes(), new_shape))
  }) %>%
    bindEvent(input$map_shape_created)
}

if (interactive()) {
  shinyApp(ui, server)
}
