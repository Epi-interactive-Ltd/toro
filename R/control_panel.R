#' Functions to manage control panel elements in a map.
#'
#' Functions:
#' - add_control_panel:         Create a control panel on the map.
#' - add_control_group:         Create a collapsible group within a control panel.
#' - remove_control_group:      Remove a control group from a control panel.
#' - add_control_to_panel:      Add a control to an existing control panel.
#' - remove_control_from_panel: Remove a control from a control panel.

#' Add a control panel to the map
#'
#' Creates a flexible control panel that can contain multiple controls.
#'
#' @param map           The map or map proxy object.
#' @param panel_id      Unique identifier for the control panel.
#' @param title         Title for the control panel. If NULL, no title is shown.
#' @param position      Position of the control panel on the map. Default is "bottom-left".
#'                      Options include "top-left", "top-right", "bottom-left", "bottom-right".
#' @param collapsible   Whether the panel can be collapsed. Default is FALSE.
#' @param collapsed     Initial collapsed state. Default is FALSE.
#' @param custom_controls List of custom controls to add initially. Each should be a list with
#'                      elements: html, id (optional), title (optional).
#' @return              The map or map proxy object for chaining.
#' @export
#' 
#' @examples
#' if (interactive()) {
#' map() |>
#'  add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
#'  add_cursor_coords_control(panel_id = "my_panel") |>
#'  add_zoom_control(panel_id = "my_panel")
#' 
#' map() |>
#'  add_control_panel(
#'    panel_id = "my_panel",
#'    title = "Map Settings",
#'    position = "top-right",
#'    collapsible = TRUE,
#'    collapsed = TRUE,
#'    direction = "row"
#'  ) |>
#'  add_cursor_coords_control(panel_id = "my_panel", section_title = "Cursor Coordinates")
#' }
add_control_panel <- function(
  map,
  panel_id,
  title = NULL,
  position = "bottom-left",
  collapsible = FALSE,
  collapsed = FALSE,
  direction = "column",
  custom_controls = NULL
) {
  options <- list(
    title = title,
    position = position,
    collapsible = collapsible,
    collapsed = collapsed,
    direction = direction,
    customControls = custom_controls
  )

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addControlPanel",
      list(id = map$id, panelId = panel_id, options = options)
    )
  } else {
    # Store panel info for initial map creation
    if (is.null(map$x$controlPanels)) {
      map$x$controlPanels <- list()
    }
    map$x$controlPanels[[panel_id]] <- list(
      panelId = panel_id,
      options = options
    )
  }

  map
}


#' Add a control group to a control panel
#'
#' Creates a collapsible group within a control panel that can contain multiple controls.
#'
#' @param map           The map or map proxy object.
#' @param panel_id      ID of the target control panel.
#' @param group_id      Unique identifier for the control group.
#' @param group_title   Title for the control group (optional).
#' @param collapsible   Whether the group can be collapsed. Default is FALSE.
#' @param collapsed     Initial collapsed state. Default is FALSE.
#' @return              The map or map proxy object for chaining.
#' @export
#' 
#' @examples
#' if (interactive()) {
#' map() |>
#'  add_control_panel(panel_id = "my_panel", direction = "row") |>
#'  add_control_group(
#'    panel_id = "my_panel",
#'    group_id = "group_1",
#'    group_title = "Group 1"
#'  ) |>
#'  add_control_group(
#'    panel_id = "my_panel",
#'    group_id = "group_2",
#'    group_title = "Group 2"
#'  ) |>
#'  add_cursor_coords_control(panel_id = "my_panel", group_id = "group_1") |>
#'  add_zoom_control(panel_id = "my_panel", group_id = "group_2")
#' 
#' map() |>
#'  add_control_panel(
#'    panel_id = "my_panel",
#'    title = "Map Settings",
#'    position = "top-right",
#'    collapsible = TRUE,
#'    collapsed = TRUE,
#'    direction = "row"
#'  ) |>
#'  add_cursor_coords_control(panel_id = "my_panel", section_title = "Cursor Coordinates")
#' }
add_control_group <- function(
  map,
  panel_id,
  group_id,
  group_title = NULL,
  collapsible = FALSE,
  collapsed = FALSE
) {
  group_config <- list(
    type = "group",
    groupId = group_id,
    groupTitle = group_title,
    collapsible = collapsible,
    collapsed = collapsed
  )

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addControlGroup",
      list(id = map$id, panelId = panel_id, groupConfig = group_config)
    )
  } else {
    # Store group for initial map creation
    if (is.null(map$x$controlPanels)) {
      map$x$controlPanels <- list()
    }

    # Initialize the panel if it doesn't exist
    if (is.null(map$x$controlPanels[[panel_id]])) {
      map$x$controlPanels[[panel_id]] <- list(
        panelId = panel_id,
        options = list(
          title = NULL,
          position = "bottom-left",
          collapsible = TRUE,
          collapsed = FALSE,
          customControls = list()
        )
      )
    }

    # Add the group to the panel's controls
    if (is.null(map$x$controlPanels[[panel_id]]$options$panelControls)) {
      map$x$controlPanels[[panel_id]]$options$panelControls <- list()
    }

    map$x$controlPanels[[panel_id]]$options$panelControls <-
      c(map$x$controlPanels[[panel_id]]$options$panelControls, list(group_config))
  }

  map
}


#' Remove a control group from a control panel
#'
#' @param proxy       The map proxy object created by `mapProxy()`.
#' @param panel_id    The ID of the control panel.
#' @param group_id    The ID of the control group to remove.
#' @return            The map proxy object for chaining.
#' @export
remove_control_group <- function(proxy, panel_id, group_id) {
  proxy$session$sendCustomMessage(
    "removeControlGroup",
    list(
      id = proxy$id,
      panelId = panel_id,
      groupId = group_id
    )
  )
  proxy
}


#' Add a control to an existing control panel
#'
#' @param map           The map or map proxy object.
#' @param panel_id      ID of the target control panel.
#' @param control_type  Type of control ("timeline", "speed", "custom").
#' @param control_options Control-specific options.
#' @param section_title Optional section title for the control.
#' @param group_id      Optional ID of the group to add the control to.
#' @return              The map or map proxy object for chaining.
#' @export
add_control_to_panel <- function(
  map,
  panel_id,
  control_type,
  control_options = list(),
  section_title = NULL,
  group_id = NULL
) {
  control_config <- list(
    type = control_type,
    options = control_options,
    title = section_title,
    groupId = group_id
  )

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addControlToPanel",
      list(id = map$id, panelId = panel_id, controlConfig = control_config)
    )
  } else {
    # Store control for initial map creation
    if (is.null(map$x$controlPanels)) {
      map$x$controlPanels <- list()
    }

    # Initialize the panel if it doesn't exist
    if (is.null(map$x$controlPanels[[panel_id]])) {
      map$x$controlPanels[[panel_id]] <- list(
        panelId = panel_id,
        options = list(
          title = NULL,
          position = "bottom-left",
          collapsible = TRUE,
          collapsed = FALSE,
          customControls = list()
        )
      )
    }

    # Add the control to the panel's customControls
    if (is.null(map$x$controlPanels[[panel_id]]$options$panelControls)) {
      map$x$controlPanels[[panel_id]]$options$panelControls <- list()
    }

    map$x$controlPanels[[panel_id]]$options$panelControls <-
      c(map$x$controlPanels[[panel_id]]$options$panelControls, list(control_config))
  }

  map
}

#' Remove a control from a control panel.
#'
#' @param proxy       The map proxy object created by `mapProxy()`.
#' @param panel_id    The ID of the control panel.
#' @param control_id  The ID of the control to remove from the panel.
#' @return            The map proxy object for chaining.
#' @export
remove_control_from_panel <- function(proxy, panel_id, control_id) {
  proxy$session$sendCustomMessage(
    "removeControlFromPanel",
    list(
      id = proxy$id,
      panelId = panel_id,
      controlId = control_id
    )
  )
  proxy
}
