library(shiny)
library(dplyr)
library(sf)
library(spData)
library(toro)


center_lon <- 173.0
center_lat <- -41.0
radius <- 7 # degrees, adjust for how far out in the ocean you want

n_points <- 25
angles <- seq(0, 2 * pi, length.out = n_points + 1)[-1] # exclude duplicate endpoint

get_route_points <- function() {
  date_seq <- seq.Date(
    from = Sys.Date(),
    by = "month",
    length.out = n_points
  )
  # Add random jitter to angles and radius
  angle_jitter <- runif(n_points, -0.2, 0.2)
  radius_jitter <- runif(n_points, -1, 1)

  coords <- cbind(
    center_lon + (radius + radius_jitter) * cos(angles + angle_jitter),
    center_lat + (radius + radius_jitter) * sin(angles + angle_jitter)
  )
  route_points <- sf::st_sf(
    id = paste0("pt", seq_len(nrow(coords))),
    date = date_seq,
    geometry = sf::st_sfc(lapply(seq_len(nrow(coords)), function(i) sf::st_point(coords[i, ]))),
    crs = 4326
  )
  route_points$hover_text <- paste("Point", route_points$id)
  return(route_points)
}

g_routes <- list(
  route1 = list(
    points = get_route_points(),
    settings = list()
  ),
  route2 = list(
    points = get_route_points(),
    settings = list(
      animatingIcon = c(
        get_layout_options(
          "symbol",
          list(icon_image = "leaf-icon", icon_size = 0.1)
        )
      ),
      routeLine = get_paint_options(
        "line",
        list(colour = "red", line_width = 2, line_dash = c(1, 2))
      )
    )
  ),
  route3 = list(
    points = get_route_points(),
    settings = list(
      animatingIcon = c(
        get_layout_options(
          "symbol",
          list(icon_image = "leaf-icon", icon_size = 0.05)
        )
      ),
      routeLine = get_paint_options(
        "line",
        list(colour = "red", line_width = 2, line_dash = c(1, 2))
      ),
      visitedPoints = get_paint_options("circle", list(colour = "yellow", circle_radius = 5)),
      steps = 500,
      dropVisited = TRUE,
      showTimelineControls = TRUE,
      timelineControlOptions = list(
        position = "top-right",
        maxTicks = 5
      ),
      showSpeedControl = TRUE,
      speedControlOptions = list(
        position = "top-right",
        values = c(0.5, 1, 1.5, 2, 3),
        labels = c("Slow", "Normal", "Fast", "Faster", "Very Fast"),
        defaultIndex = 2
      )
    )
  )
)

ui <- fluidPage(
  theme = bslib::bs_theme(version = 5),
  shinyjs::useShinyjs(),
  toro::mapOutput("map"),
  selectInput(
    "route",
    "Select route",
    choices = c("Route 1" = "route1", "Route 2" = "route2", "Route 3" = "route3")
  ),
  actionButton("add_route", "Add route"),
  actionButton("start_route", "Start route"),
  actionButton("pause_route", "Pause route"),
  actionButton("remove_route", "Remove route"),
)

server <- function(input, output, session) {
  # Reactives ------------------------------------------------------

  # Render UI -------------------------------------------------------

  output$map <- toro::renderMap({
    toro::map(style = "natgeo", loadedTiles = c("natgeo")) |>
      set_zoom(3) |>
      add_image(
        image_id = "leaf-icon",
        image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Leaf_Icon.png/640px-Leaf_Icon.png"
      )
  })

  # Observers -------------------------------------------------------------

  observe({
    req(!is.null(input$map_loaded), !is.null(input$route))
    toro::mapProxy("map") |>
      add_route(
        input$route,
        g_routes[[input$route]]$points,
        settings = g_routes[[input$route]]$settings
      )
  }) %>%
    bindEvent(input$add_route)

  observe({
    req(!is.null(input$map_loaded), !is.null(input$route))
    toro::mapProxy("map") |>
      play_route(input$route)
  }) %>%
    bindEvent(input$start_route)

  observe({
    req(!is.null(input$map_loaded), !is.null(input$route))
    toro::mapProxy("map") |>
      pause_route(input$route)
  }) %>%
    bindEvent(input$pause_route)

  observe({
    req(!is.null(input$map_loaded), !is.null(input$route))
    toro::mapProxy("map") |>
      remove_route(input$route)
  }) %>%
    bindEvent(input$remove_route)
}

if (interactive()) {
  shinyApp(ui, server)
}
