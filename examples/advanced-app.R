library(shiny)
library(dplyr)
library(sf)
library(spData)
library(maplibReGL)

data(quakes)
quakes_data <- quakes %>%
  mutate(
    description = paste(
      "<div class='map-popup'>Location:",
      lat,
      ",",
      long,
      "<br>",
      "Magnitude:",
      mag,
      "</div>"
    )
  ) %>%
  st_as_sf(coords = c("long", "lat"), crs = 4326)

nz_data <- spData::nz %>%
  rename(geometry = geom)
nz_data <- st_transform(nz_data, 4326)

nz_data_points <- nz_data %>%
  st_centroid()

nz_height_data <- st_transform(spData::nz_height, 4326) %>%
  arrange(desc(elevation)) %>%
  head(50)

colours <- c("red", "orange", "yellow", "green", "blue", "purple", "pink")

ui <- fluidPage(
  theme = bslib::bs_theme(version = 5),
  shinyjs::useShinyjs(),
  tags$head(
    maplibReGL::addMaplibreDependencies()
  ),
  maplibReGL::mapOutput("map"),
  h2("Circle options"),
  p("using local data (earthquake data)"),
  selectInput(
    "small",
    "Magnitude <= 4.0",
    choices = colours
  ),
  selectInput(
    "med",
    "5.0 <= Magnitude <= 6.0",
    choices = colours
  ),
  selectInput(
    "large",
    "Magnitude > 6.0",
    choices = colours
  )
)

server <- function(input, output, session) {
  map <- maplibReGL::map(
    elementId = "map",
    props = list(
      # Have a map loader until these layers are loaded
      initialLoadedLayers = c("quakes", "nz_polygons"),
      imageSources = list(
        list(
          id = "cat",
          url = "https://upload.wikimedia.org/wikipedia/commons/7/7c/201408_cat.png"
        )
      )
    )
  )

  output$map <- maplibReGL::renderMap({
    map$ui()
  })

  # Add sources and layers to the map once it is loaded
  observeEvent(input$map_loaded, {
    map$add_layer(
      layer_options = list(
        id = "nz_polygons",
        type = "fill",
        source = nz_data,
        paint = maplibReGL::getPaintOptions("fill", options = list(opacity = 0.6))
      ),
      hover_column = "Name"
    )
    map$add_layer(
      layer_options = list(
        id = "quakes",
        type = "circle",
        source = quakes_data
      ),
      hover_colum = "description"
    )
    # Add labels to the center of the polygons
    map$add_layer(
      layer_options = list(
        id = "text_layer",
        type = "symbol",
        source = nz_height_data,
        layout = maplibReGL::getLayoutOptions(
          "symbol",
          options = list(
            icon_image = "cat",
            icon_size = 0.2
          )
        )
      ),
      can_cluster = TRUE,
      popup_column = "elevation"
    )
  })

  #' Observe the colour inputs and update the circle colour based on the magnitude
  #' of the earthquake data.
  observe({
    req(input$map_loaded)
    map$set_paint_property(
      layer_id = "quakes",
      property_name = "circle-color",
      value = maplibReGL::getColumnStepColours(
        column_name = "mag",
        breaks = c(4, 5, 6),
        colours = c("black", input$small, input$med, input$large)
      )
    )
  }) %>%
    bindEvent(input$small, input$med, input$large, input$map_loaded)
}

if (interactive()) {
  shinyApp(ui, server)
}
