library(shiny)
library(dplyr)
library(sf)
library(spData)
library(maplibReGL)

data(quakes)
quakes_data <- quakes |>
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
  ) |>
  st_as_sf(coords = c("long", "lat"), crs = 4326)

nz_data <- spData::nz |>
  rename(geometry = geom) |>
  mutate(supported = Island == "South")
nz_data <- st_transform(nz_data, 4326)

nz_data_points <- nz_data |>
  st_centroid()

nz_height_data <- st_transform(spData::nz_height, 4326) |>
  arrange(desc(elevation)) |>
  head(50)

colours <- c("red", "orange", "yellow", "green", "blue", "purple", "pink")

ui <- fluidPage(
  maplibReGL::mapOutput("map"),
  div(
    class = "row",
    div(
      class = "col",
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
      ),
    ),
    div(
      class = "col",
      h2("Polygon(fill) options"),
      p("using NZ polygons data"),
      selectInput("target_region", "Target Region", choices = sort(unique(nz_data$Name)))
    )
  )
)

server <- function(input, output, session) {
  # Render UI -------------------------------------------------------

  output$map <- maplibReGL::renderMap({
    maplibReGL::map(
      # Have a map loader until these layers are loaded
      initialLoadedLayers = c("quakes", "nz_polygons"),
      imageSources = list(
        list(
          id = "cat",
          url = "https://upload.wikimedia.org/wikipedia/commons/7/7c/201408_cat.png"
        )
      ),
      spinnerWhileBusy = TRUE # Have a secondary loader for when shiny is busy
    ) |>

      set_zoom(3) |>
      add_feature_server_source(
        "https://services1.arcgis.com/VwarAUbcaX64Jhub/arcgis/rest/services/World_Exclusive_Economic_Zones_Boundaries/FeatureServer",
        "eez"
      ) |>
      add_line_layer(id = "eez_lines", source = "eez") |>
      add_fill_layer(
        id = "nz_polygons",
        source = nz_data,
        paint = maplibReGL::get_paint_options(
          "fill",
          options = list(
            opacity = 0.6,
            colour = maplibReGL::get_column_boolean(
              "supported",
              "#808080",
              "#FF4F00"
            )
          )
        ),
        hover_column = "Name"
      ) |>
      add_circle_layer(
        id = "quakes",
        source = quakes_data,
        hover_column = "description"
      ) |>
      # Add labels to the center of the polygons
      add_symbol_layer(
        id = "text_layer",
        source = nz_height_data,
        layout = maplibReGL::get_layout_options(
          "symbol",
          options = list(
            icon_image = "cat",
            icon_size = 0.2
          )
        ),
        can_cluster = TRUE,
        popup_column = "elevation"
      )
  })

  # Observers -------------------------------------------------------------

  #' Observe the colour inputs and update the circle colour based on the magnitude
  #' of the earthquake data.
  observe({
    req(input$map_loaded)
    maplibReGL::mapProxy("map") |>
      set_paint_property(
        layer_id = "quakes",
        property_name = "circle-color",
        value = maplibReGL::get_column_step_colours(
          column_name = "mag",
          breaks = c(4, 5, 6),
          colours = c("black", input$small, input$med, input$large)
        )
      )
  }) |>
    bindEvent(input$small, input$med, input$large, input$map_loaded)

  #' Update the opacity of the target polygon
  observe({
    req(input$map_loaded)
    maplibReGL::mapProxy("map") |>
      set_paint_property(
        layer_id = "nz_polygons",
        property_name = "fill-opacity",
        value = maplibReGL::get_column_group(
          "Name",
          setNames(0.6, input$target_region),
          0.3
        )
      )
  }) |>
    bindEvent(input$target_region)

  #' Get clicked feature information
  observe({
    req(input$map_feature_click)
    print(maplibReGL::get_clicked_feature(input$map_feature_click))
  })
}

if (interactive()) {
  shinyApp(ui, server)
}
