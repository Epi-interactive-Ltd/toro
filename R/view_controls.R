#' Functions related to zoom controls.

#' Add a zoom control to the map.
#'
#' @note See [Maplibre NavigationControl docs](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/NavigationControlOptions/)
#' for more information on available options.
#'
#' @param map The map or map proxy object.
#' @param position The position of the zoom control on the map. Default is `"top-right"`.
#' @param control_options Additional options for the zoom control. Default is an empty list.
#' @param panel_id ID of control panel to add to (optional).
#' @param section_title Section title when added to a control panel.
#' @param group_id Optional ID of the group to add the control to within a panel.
#' @return The map proxy object for chaining.
#' @export
#'
#' @examples
#' \dontrun{
#' add_zoom_control(map())
#'
#' # Inside a control panel
#' map() |>
#'  add_control_panel(panel_id = "my_panel", title = "View Controls") |>
#'  add_zoom_control(panel_id = "my_panel")
#' }
#'
add_zoom_control <- function(
  map,
  position = "top-right",
  control_options = list(),
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
) {
  control_config <- list(
    type = "zoom",
    position = position,
    controlOptions = control_options,
    panelId = panel_id,
    panelTitle = section_title,
    groupId = group_id
  )

  if (inherits(map, "mapProxy")) {
    if (!is.null(panel_id)) {
      # Add to control panel
      add_control_to_panel(
        map,
        panel_id,
        "zoom",
        control_config,
        section_title,
        group_id
      )
    } else {
      # Add as standalone control
      map$session$sendCustomMessage(
        "addZoomControl",
        list(
          id = map$id,
          position = position,
          controlOptions = control_options
        )
      )
    }
  } else {
    if (is.null(map$x$zoomControl)) {
      map$x$zoomControl <- control_config
      map$x$controls <- c(map$x$controls, list(control_config))
    }
  }
  map
}

#' Remove the zoom control from the map.
#'
#' @param proxy The map proxy object created by `mapProxy()`.
#' @param panel_id Optional. If provided, removes the zoom control from the specified control panel.
#'    If NULL, removes the standalone zoom control.
#' @return The map proxy object for chaining.
#' @export
#'
#' @examples
#' \dontrun{
#' library(shiny)
#' library(toro)
#'
#' ui <- fluidPage(
#'  tagList(
#'    mapOutput("map"),
#'    checkboxInput("has_zoom_controls", "Remove Zoom Controls", value = TRUE)
#'  )
#' )
#' server <- function(input, output, session) {
#'  output$map <- renderMap({
#'    map() |>
#'      add_zoom_control()
#'  })
#'
#'  observe({
#'    req(input$map_loaded)
#'    if (input$has_zoom_controls == TRUE) {
#'      mapProxy("map") |>
#'        add_zoom_control()
#'    } else {
#'      mapProxy("map") |>
#'        remove_zoom_control()
#'    }
#'  }) |>
#'    bindEvent(input$has_zoom_controls)
#' }
#' }
remove_zoom_control <- function(proxy, panel_id = NULL) {
  # Use the namespaced control ID pattern: zoom-control-{mapId}
  control_id <- paste0("zoom-control-", proxy$id)

  if (!is.null(panel_id)) {
    # Remove from control panel
    remove_control_from_panel(proxy, panel_id, control_id)
  } else {
    # Remove standalone control
    remove_control(proxy, control_id)
  }
}
