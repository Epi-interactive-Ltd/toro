library(shiny)
library(dplyr)
library(sf)
library(toro)

all_controls <- c(
  "Zoom Control" = "zoom_control",
  "Cursor Coordinates" = "cursor_coords",
  "Custom Control 1" = "custom_1",
  "Custom Control 2" = "custom_2",
  "Draw Control" = "draw_control"
)

ui <- fluidPage(
  toro::mapOutput("map"),
  checkboxGroupInput(
    inputId = "controls",
    label = "Visible Controls",
    choices = all_controls,
    selected = all_controls
  ),
  uiOutput("drawn_shapes")
)

server <- function(input, output, session) {
  shapes <- reactiveVal(sf::st_sf(
    data.frame(
      id = character()
    ),
    geometry = sf::st_sfc(),
    crs = 4326
  ))

  output$map <- toro::renderMap({
    toro::map(style = "satellite") |>
      add_lat_lng_grid("green") |>
      add_cursor_coords_control() |>
      add_zoom_control() |>
      add_custom_control(
        id = "custom_1",
        html = "<div style='background: white; padding: 5px;'>I am a custom div</div>"
      ) |>
      add_custom_control(
        id = "custom_2",
        html = "<div style='background: white; padding: 5px;'>I am a second custom div</div>"
      ) |>
      add_draw_control()
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

  observe({
    req(input$map_shape_created)
    new_shape <- toro::get_drawn_shape(input$map_shape_created)

    shapes(rbind(shapes(), new_shape))
  }) %>%
    bindEvent(input$map_shape_created)

  # Show/hide controls
  observe({
    req(input$controls)
    proxy <- toro::mapProxy("map")

    for (control in all_controls) {
      toggle_control(proxy, control, show = control %in% input$controls)
    }
  })
}

if (interactive()) {
  shinyApp(ui, server)
}
