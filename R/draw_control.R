#' Add a draw control to the map
#'
#' The draw control allows users to draw shapes (polygons, lines, points) on the map.
#' The drawn shapes can be styled and managed through the control options.
#' Information about the drawn shapes can be retrieved in Shiny using the
#' `input$map_shape_created` (where `map` is the ID of the map) reactive value.
#'
#' For a more in-depth example see the
#' [Draw control](https://epi-interactive-ltd.github.io/toro/articles/examples/controls/draw-control.html)
#' article.
#'
#' @param map The map or map proxy object.
#' @param id The ID for the draw control.
#' @param position The position of the draw control on the map. Default is `"top-right"`.
#'    Options are "top-left", "top-right", "bottom-left", "bottom-right".
#' @param modes A vector of modes to enable in the draw control. Default is `c("polygon")`.
#'    Options include "polygon", "delete", "line", and "point".
#' @param active_colour The colour for the drawn shapes. Default is `"#04AAC1"`.
#' @param inactive_colour The colour for the inactive shapes. Default is `"#04AAC1"`.
#' @param mode_labels A named list of labels for each mode.
#'    For example, `list(polygon = "Draw Polygon", delete = "Delete Shape")`.
#' @param features Optional. An `sf` object or GeoJSON string of pre-drawn shapes to
#'    populate the draw control with on initialisation.
#' @param panel_id ID of control panel to add to (optional).
#' @param section_title Section title when added to a control panel.
#' @param group_id Optional group ID for grouping controls within a panel.
#' @return The map or map proxy object for chaining.
#' @export
#'
#' @seealso [get_drawn_shape()] to retrieve the drawn shape as an `sf` object in Shiny.
#'
#' @examples
#' map() |>
#'  add_draw_control()
add_draw_control <- function(
  map,
  id = "draw_control",
  position = "top-right",
  modes = c("polygon"),
  active_colour = "#04AAC1",
  inactive_colour = "#04AAC1",
  mode_labels = list(),
  features = NULL,
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
) {
  # Convert sf or GeoJSON string to a plain list for JSON serialisation
  if (!is.null(features)) {
    if (inherits(features, "sf") || inherits(features, "sfc")) {
      features <- geojsonsf::sf_geojson(features, atomise = FALSE)
    }
    if (is.character(features)) {
      features <- jsonlite::fromJSON(features, simplifyVector = FALSE)
    }
  }

  control <- list(
    type = "draw",
    controlId = id,
    position = position,
    modes = list(modes),
    activeColour = active_colour,
    inactiveColour = inactive_colour,
    modeLabels = mode_labels,
    features = features,
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

#' Remove the draw control from the map
#'
#' @param proxy The map proxy object created by `mapProxy()`.
#' @param panel_id  Optional. If provided, removes the draw control from the specified control
#'    panel. If NULL, removes the standalone draw control.
#' @return The map proxy object for chaining.
#' @export
#'
#' @examples
#' if(interactive()){
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

#' Delete a drawn shape from the map
#'
#' The ID of the shape is provided by the draw control when a shape is created.
#'
#' @param proxy The map proxy object created by `mapProxy()`.
#' @param shape_id The ID of the shape to delete.
#' @return The map proxy object for chaining.
#' @export
#'
#' @examples
#' if(interactive()){
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

#' Update the geometry of an existing drawn shape on the map
#'
#' @param proxy The map proxy object created by `mapProxy()`.
#' @param shape_id The ID of the shape to update.
#' @param new_geometry The new geometry for the shape, provided as an `sf`
#' object, GeoJSON string, or list that can be converted to GeoJSON.
#' @return The map proxy object for chaining.
#' @export
#'
#' @example inst/examples/draw-controls.R
update_drawn_shape <- function(proxy, shape_id, new_geometry) {
  new_geometry <- .normalize_draw_geometry(new_geometry, shape_id = shape_id)

  proxy$session$sendCustomMessage(
    "addDrawnShape",
    list(id = proxy$id, geometry = new_geometry)
  )
  proxy
}

#' Add a shape to the map as a drawn shape object
#'
#' @param proxy The map proxy object created by `mapProxy()`.
#' @param new_geometry The geometry for the new shape, provided as an `sf`
#' object, GeoJSON string, or list that can be converted to GeoJSON.
#' @return The map proxy object for chaining.
#' @export
#'
#' @example inst/examples/draw-controls.R
add_drawn_shape <- function(proxy, new_geometry) {
  new_geometry <- .normalize_draw_geometry(new_geometry)

  proxy$session$sendCustomMessage(
    "addDrawnShape",
    list(id = proxy$id, geometry = new_geometry)
  )
  proxy
}

#' Normalize the geometry input for adding/updating drawn shapes
#'
#' @keywords internal
#' @noRd
.normalize_draw_geometry <- function(geometry, shape_id = NULL) {
  if (inherits(geometry, c("sf", "data.frame", "tbl"))) {
    geometry <- .validate_source_data(geometry)
  }

  if (is.character(geometry)) {
    geometry <- jsonlite::fromJSON(geometry, simplifyVector = FALSE)
  }

  if (!is.list(geometry) || is.null(geometry$type)) {
    stop("new_geometry must be a GeoJSON Feature or FeatureCollection")
  }

  if (!is.null(shape_id)) {
    shape_id <- as.character(shape_id[[1]])
  }

  promote_id <- function(feature) {
    if (is.null(feature$id) && !is.null(feature$properties$id)) {
      feature$id <- feature$properties$id
    }
    feature
  }

  if (identical(geometry$type, "FeatureCollection")) {
    features <- geometry$features
    if (is.null(features)) {
      features <- list()
    }
    features <- lapply(features, promote_id)

    # update_drawn_shape should target a single existing feature id
    if (!is.null(shape_id) && length(features) == 1) {
      features[[1]]$id <- shape_id
    }

    geometry$features <- features
    return(geometry)
  }

  if (identical(geometry$type, "Feature")) {
    geometry <- promote_id(geometry)
    if (!is.null(shape_id)) {
      geometry$id <- shape_id
    }
    return(geometry)
  }

  stop("new_geometry must be a GeoJSON Feature or FeatureCollection")
}
