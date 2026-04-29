#' Get the sf data frame of a clicked feature from the map widget
#'
#' The click input is a list containing the `layerId`, `properties`, `geometry`, and
#' `time`. Turn this into an `sf` object.
#'
#' To get the clicked feature, use `input$map_feature_click` in a Shiny app, where `map` is the
#' ID of your map output. This input will contain a list representing the clicked feature whenever a
#' feature is clicked on the map. Pass this input to `get_clicked_feature()` to convert it into an
#' `sf` object for easier manipulation in R.
#'
#' @note `time` is not used in this function, but it is included in the input so that
#' the same feature can be clicked multiple times and the changed time means that the
#' input will be updated.
#'
#' @param clicked_feature_input A list representing the clicked feature.
#' @return A `sf` object representing the clicked feature, or `NULL`.
#' @export
#'
#' @examples
#' if(interactive()){
#' library(shiny)
#' library(spData)
#' library(sf)
#' library(toro)
#'
#' nz_data <- spData::nz_height |>
#'   sf::st_transform(4326)
#'
#' ui <- fluidPage(
#'  tagList(
#'    mapOutput("map")
#'  )
#' )
#' server <- function(input, output, session) {
#'  output$map <- renderMap({
#'    map() |>
#'      set_bounds(bounds = nz_data) |>
#'      add_circle_layer(
#'        id = "nz_elevation",
#'        source = nz_data
#'      )
#'  })
#'
#'  # Print the clicked feature as an sf object
#'  observe({
#'    req(input$map_loaded, input$map_feature_click)
#'    print(get_clicked_feature(input$map_feature_click))
#'  }) |>
#'    bindEvent(input$map_feature_click)
#' }
#' }
get_clicked_feature <- function(clicked_feature_input) {
  if (
    is.null(clicked_feature_input) ||
      !is.list(clicked_feature_input) ||
      length(clicked_feature_input) == 0
  ) {
    return(NULL)
  }
  # Build a GeoJSON Feature from the list
  geojson <- list(
    type = "Feature",
    layer_id = clicked_feature_input$layerId,
    properties = clicked_feature_input$properties,
    geometry = clicked_feature_input$geometry
  )
  # Convert to JSON and then to sf
  geojsonsf::geojson_sf(jsonlite::toJSON(geojson, auto_unbox = TRUE))
}

#' Get the drawn shape from the map widget
#'
#' Parses the JSON string returned by the map widget when a shape is drawn.
#' Ensures that the ID of the shape is included in the resulting `sf` object.
#'
#' To get the drawn shape, use `input$map_shape_created` in a Shiny app, where `map` is the ID of
#' your map output. This input will contain a JSON string representing the drawn shape whenever a
#' new shape is created using the draw control on the map. Pass this input to `get_drawn_shape()`
#' to convert it into an `sf` object for easier manipulation in R.
#'
#' @param create_input_string A JSON string representing the drawn shape.
#' @return A `sf` object representing the drawn shape, or `NULL`.
#' @export
#'
#' @examples
#' if(interactive()){
#' library(shiny)
#' library(toro)
#'
#' ui <- fluidPage(
#'  tagList(
#'    mapOutput("map")
#'  )
#' )
#' server <- function(input, output, session) {
#'  output$map <- renderMap({
#'    map() |>
#'     add_draw_control()
#'  })
#'
#'  # Update the list of drawn shape IDs when a new shape is created
#'  observe({
#'    req(input$map_loaded, input$map_shape_created)
#'    new_shape <- get_drawn_shape(input$map_shape_created)
#'    print(new_shape)
#'  }) |>
#'    bindEvent(input$map_shape_created)
#' }
#' }
get_drawn_shape <- function(create_input_string) {
  if (is.null(create_input_string) || create_input_string == "") {
    return(NULL)
  }
  feat <- jsonlite::fromJSON(create_input_string)
  sf_obj <- geojsonsf::geojson_sf(create_input_string)
  sf_obj$id <- feat$id
  sf_obj
}
