library(shiny)
library(dplyr)
library(sf)
library(toro)

get_polygon <- function() {
  random_offset <- runif(1, -10, 10)
  sf::st_sf(
    geometry = sf::st_sfc(
      sf::st_polygon(list(matrix(
        c(
          174.7,
          -36.8,
          174.8,
          -36.8,
          174.8,
          -36.9,
          174.7,
          -36.9,
          174.7,
          -36.8
        ) +
          random_offset,
        ncol = 2,
        byrow = TRUE
      ))),
      crs = 4326
    )
  )
}

ui <- bootstrapPage(
  tagList(
    mapOutput("map"),
    actionButton("add", "Add shape"),
    actionButton("update", "Update shape"),
    actionButton("delete", "Delete shape"),
    h2("Selected shape ID"),
    textOutput("selected_shape")
  )
)

server <- function(
  input,
  output,
  session
) {
  selected_shape_id <- reactiveVal(NULL)

  output$map <- renderMap({
    map() |>
      add_draw_control(
        modes = c("polygon", "line", "delete"),
        features = get_polygon()
      )
  })

  output$selected_shape <- renderText({
    selected_shape_id()
  })

  observe({
    print(input$map_feature_click)
    selected_shape_id(input$map_feature_click$properties$id)
  }) |>
    bindEvent(input$map_feature_click)

  observe({
    add_drawn_shape(mapProxy("map"), get_polygon())
    selected_shape_id(NULL)
  }) |>
    bindEvent(input$add)

  observe({
    req(selected_shape_id())
    update_drawn_shape(mapProxy("map"), selected_shape_id(), get_polygon())
  }) |>
    bindEvent(input$update)

  observe({
    req(selected_shape_id())
    delete_drawn_shape(mapProxy("map"), selected_shape_id())
    selected_shape_id(NULL)
  }) |>
    bindEvent(input$delete)
}

if (interactive()) {
  shinyApp(ui, server)
}
