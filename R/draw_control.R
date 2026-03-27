#' Functions related to the draw control.

#' Add a draw control to the map
#'
#' @param map The map or map proxy object.
#' @param id The ID for the draw control.
#' @param position The position of the draw control on the map. Default is `"top-right"`.
#'    Options are "top-left", "top-right", "bottom-left", "bottom-right".
#' @param modes A vector of modes to enable in the draw control. Default is `c("polygon", "trash")`.
#'    Options include "polygon", "trash", "line".
#' @param active_colour The colour for the drawn shapes. Default is `"#0FB3CE"`.
#' @param inactive_colour The colour for the inactive shapes. Default is `"#0FB3CE"`.
#' @param mode_labels A named list of labels for each mode.
#'    For example, `list(polygon = "Draw Polygon", trash = "Delete Shape")`.
#' @param panel_id ID of control panel to add to (optional).
#' @param section_title Section title when added to a control panel.
#' @param group_id Optional group ID for grouping controls within a panel.
#' @return The map or map proxy object for chaining.
#' @export
#'
#' @examples
#' \dontrun{
#' map() |>
#'  add_draw_control()
#' }
add_draw_control <- function(
  map,
  id = "draw_control",
  position = "top-right",
  modes = c("polygon", "trash"),
  active_colour = "#0FB3CE",
  inactive_colour = "#0FB3CE",
  mode_labels = list(),
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
) {
  control <- list(
    type = "draw",
    controlId = id,
    position = position,
    modes = list(modes),
    activeColour = active_colour,
    inactiveColour = inactive_colour,
    modeLabels = mode_labels,
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
        "draw",
        control,
        section_title,
        group_id
      )
    } else {
      # Add as standalone control
      map$session$sendCustomMessage(
        "addDraw",
        list(id = map$id, options = control)
      )
    }
  } else {
    if (is.null(map$x$drawControl)) {
      map$x$drawControl <- control
      map$x$controls <- c(map$x$controls, list(control))
    }
  }
  map
}

#' Remove the draw control from the map.
#'
#' @param proxy The map proxy object created by `mapProxy()`.
#' @param panel_id  Optional. If provided, removes the draw control from the specified control
#'    panel. If NULL, removes the standalone draw control.
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
#'    actionButton("remove_draw_control", "Remove draw control")
#'  )
#' )
#' server <- function(input, output, session) {
#'  output$map <- renderMap({
#'    map() |>
#'     add_draw_control()
#'  })
#'
#'  observe({
#'    req(input$map_loaded)
#'    mapProxy("map") |>
#'      remove_draw_control()
#'  }) |>
#'    bindEvent(input$remove_draw_control)
#' }
#' }
remove_draw_control <- function(proxy, panel_id = NULL) {
  # Use the namespaced control ID pattern: draw-control-{mapId}
  control_id <- paste0("draw-control-", proxy$id)

  if (!is.null(panel_id)) {
    # Remove from control panel
    remove_control_from_panel(proxy, panel_id, control_id)
  } else {
    # Remove standalone control
    remove_control(proxy, control_id)
  }
  proxy
}

#' Delete a drawn shape from the map.
#'
#' The ID of the shape is provided by the draw control when a shape is created.
#'
#' @param proxy The map proxy object created by `mapProxy()`.
#' @param shape_id The ID of the shape to delete.
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
#'    selectInput("shape_ids", "Drawn shape IDs", choices = NULL),
#'    actionButton("remove_drawn_shape", "Remove drawn shape")
#'  )
#' )
#' server <- function(input, output, session) {
#'  drawn_shape_ids <- reactiveVal(character())
#'
#'  output$map <- renderMap({
#'    map() |>
#'     add_draw_control()
#'  })
#'
#'  # Update the select input options with current shape IDs
#'  observe({
#'    req(input$map_loaded)
#'    updateSelectInput(inputId = "shape_ids", choices = drawn_shape_ids())
#'  })
#'
#'  # Update the list of drawn shape IDs when a new shape is created
#'  observe({
#'    req(input$map_loaded, input$map_shape_created)
#'    new_shape <- get_drawn_shape(input$map_shape_created)
#'    drawn_shape_ids(c(drawn_shape_ids(), new_shape$id))
#'  }) |>
#'    bindEvent(input$map_shape_created)
#'
#'  # Delete the selected drawn shape when the button is clicked
#'  observe({
#'    req(input$map_loaded, input$shape_ids)
#'    mapProxy("map") |>
#'      delete_drawn_shape(input$shape_ids)
#'    # Remove the deleted shape ID from the list of drawn shape IDs
#'    drawn_shape_ids(setdiff(drawn_shape_ids(), input$shape_ids))
#'  }) |>
#'    bindEvent(input$remove_drawn_shape)
#' }
#' }
delete_drawn_shape <- function(proxy, shape_id) {
  proxy$session$sendCustomMessage(
    "deleteDrawnShape",
    list(id = proxy$id, shapeId = shape_id)
  )
  proxy
}
