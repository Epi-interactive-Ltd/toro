library(shiny)
library(dplyr)
library(sf)
library(toro)


ui <- fluidPage(
  mapOutput("map"),
  actionButton("remove_control", "Remove paint control"),
  actionButton("add_control", "Add paint control")
)

nz_long <- c(
  172.2041,
  182.2494,
  168.1286,
  163.9383,
  171.7449
)
nz_lat <- c(
  -32.56960,
  -38.85522,
  -48.49620,
  -46.43999,
  -34.62533
)

nz_line <- sf::st_sf(
  id = 1,
  geometry = sf::st_sfc(sf::st_linestring(cbind(nz_long, nz_lat)), crs = 4326)
)

nz_points <- sf::st_cast(nz_line, "POINT") |>
  mutate(id = row_number())

nz_points$date <- seq.Date(
  from = as.Date("2026-01-01"),
  to = as.Date("2026-01-05"),
  by = "day"
)
nz_points$lat <- nz_lat
nz_points$long <- nz_long
nz_points$tici <- seq_len(nrow(nz_points))
nz_points$group <- c("A", "B", "A", "C", "D")
nz_points$colour <- c("red", "pink", "green", "orange", "blue")
nz_points$bool <- c(FALSE, FALSE, FALSE, TRUE, TRUE)

paint_options <- list(
  list(
    id = "default",
    label = "Default",
    paint = get_paint_options(
      "circle",
      list(
        colour = "#FFCD00",
        circle_radius = 5,
        outline_colour = "black"
      )
    )
  ),
  list(
    id = "colour",
    label = "Colour",
    paint = get_paint_options(
      "circle",
      list(
        colour = get_column("colour"),
        circle_radius = 6,
        outline_colour = "white"
      )
    )
  ),
  list(
    id = "bool",
    label = "Bool",
    paint = get_paint_options(
      "circle",
      list(
        colour = get_column_boolean("bool", "white", "red"),
        circle_radius = 6,
        outline_colour = "white"
      )
    )
  ),
  list(
    id = "steps",
    label = "Steps",
    paint = get_paint_options(
      "circle",
      list(
        colour = get_column_steps(
          "long",
          c(171, 172, 178),
          c("red", "orange", "yellow", "green")
        ),
        circle_radius = 6,
        outline_colour = "white"
      )
    )
  ),
  list(
    id = "group",
    label = "Group",
    paint = get_paint_options(
      "circle",
      list(
        colour = get_column_group(
          "group",
          c("A" = "red", "B" = "yellow"),
          "white"
        ),
        circle_radius = 6,
        outline_colour = "white",
        opacity = get_column_group(
          "group",
          stats::setNames(c(0.9, 0.7), c("A", "B")),
          0.3
        )
      )
    )
  )
)

server <- function(input, output, session) {
  # Render UI -------------------------------------------------------

  output$map <- toro::renderMap({
    toro::map() |>
      set_zoom(3) |>
      add_source("my_source", nz_points) |>
      add_circle_layer("circle_layer", "my_source") |>
      add_paint_control(
        "my_paint_control",
        "circle_layer",
        paint_options,
        label = "Index",
        default = "steps"
      )
  })

  # Observers -------------------------------------------------------------

  observe({
    req(input$map_loaded)
    remove_paint_control(mapProxy("map"), "my_paint_control")
  }) |>
    bindEvent(input$remove_control)

  observe({
    req(input$map_loaded)
    add_paint_control(
      mapProxy("map"),
      "my_paint_control",
      "circle_layer",
      paint_options,
      default = "bool"
    )
  }) |>
    bindEvent(input$add_control)
}

if (interactive()) {
  shinyApp(ui, server)
}
