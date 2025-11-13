#' Utilities for the map related to controls.
#'
#' Functions:
#' - toggle_control:                Toggle the visibility of a control on the map.
#' - remove_control:                Remove a control from the map.
#' - add_custom_control:            Add a custom HTML control to the map.
#' - remove_custom_control:         Remove a custom control from the map.
#' - add_cursor_coords_control:     Add a cursor coordinates control to the map.
#' - remove_cursor_coords_control:  Remove the cursor coordinates control from the map.

#' Toggle the visibility of a control on the map.
#'
#' @param proxy       The map proxy object created by `mapProxy()`.
#' @param control_id  The ID of the control to toggle.
#' @param show        Logical indicating whether to show or hide the control. Default is `TRUE`.
#' @return            The map proxy object for chaining.
#' @export
#'
#' @examples
#' if (interactive()) {
#' # In a Shiny app:
#' output$map <- renderMap({
#'  map() |>
#'    add_zoom_control() |>
#'    add_custom_control(
#'      id = "custom_control",
#'      html = "<p>I am a custom control</p>"
#'    )
#' })
#'
#' # In an observer:
#' mapProxy("map") |>
#'  toggle_control("zoom_control", show = FALSE) |>
#'  toggle_control("custom_control", show = FALSE)
#' }
toggle_control <- function(proxy, control_id, show = TRUE) {
  proxy$session$sendCustomMessage(
    "toggleControl",
    list(
      id = proxy$id,
      controlId = control_id,
      show = show
    )
  )
  proxy
}

#' Remove a control from the map.
#'
#' @param proxy       The map proxy object created by `mapProxy()`.
#' @param control_id  The ID of the control to remove.
#' @return            The map proxy object for chaining.
#' @export
#'
#' @examples
#' if (interactive()) {
#' # In a Shiny app:
#' output$map <- renderMap({
#'  map() |>
#'    add_zoom_control() |>
#'    add_custom_control(
#'      id = "custom_control",
#'      html = "<p>I am a custom control</p>"
#'    )
#' })
#'
#' # In an observer:
#' mapProxy("map") |>
#'  remove_control("zoom_control") |>
#'  remove_control("custom_control")
#' }
remove_control <- function(proxy, control_id) {
  proxy$session$sendCustomMessage(
    "removeControl",
    list(
      id = proxy$id,
      controlId = control_id
    )
  )
  proxy
}


#' Add a custom HTML control to the map.
#'
#' @param map         The map or map proxy object.
#' @param id          The ID for the custom control.
#' @param html        The HTML content to add as a control.
#' @param position    The position of the control on the map. Default is `"top-right"`.
#'                    Options include "top-left", "top-right", "bottom-left", "bottom-right".
#' @param panel_id    ID of control panel to add to (optional).
#' @param section_title Section title when added to a control panel.
#' @return            The map or map proxy object for chaining.
#' @export
#'
#' @examples
#' if (interactive()) {
#' # Add to a map
#' map() |>
#'  add_custom_control(
#'    id = "custom_control",
#'    html = "<p>I am a custom control</p>"
#' )
#'
#' # Add to a control panel
#' map() |>
#'  add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
#'  add_custom_control(
#'    id = "custom_control_panel",
#'    html = "<p>I am a custom control in a panel</p>",
#'    panel_id = "my_panel",
#'    section_title = "Custom Control Section"
#'  )
#'
#' # Add to a control panel inside a control group
#' map() |>
#'  add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
#'  add_control_group(
#'    panel_id = "my_panel",
#'    group_id = "custom_controls",
#'    group_title = "Custom Controls"
#'    ) |>
#'  add_custom_control(
#'    id = "custom_control_panel",
#'    html = "<p>I am a custom control in a panel</p>",
#'    panel_id = "my_panel",
#'    group_id = "custom_controls"
#'  )
#' }
add_custom_control <- function(
  map,
  id,
  html,
  position = "top-right",
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
) {
  control <- list(
    type = "custom",
    controlId = id,
    html = html,
    position = position,
    panelId = panel_id,
    panelTitle = section_title,
    groupId = group_id
  )

  if (inherits(map, "mapProxy")) {
    if (!is.null(panel_id)) {
      # Add to control panel
      add_control_to_panel(map, panel_id, "custom", control, section_title, group_id)
    } else {
      # Add as standalone control
      map$session$sendCustomMessage(
        "addCustomControl",
        list(id = map$id, options = control)
      )
    }
  } else {
    map$x$customControls <- c(map$x$customControls, list(control))
    map$x$controls <- c(map$x$controls, list(control))
  }
  map
}

#' Remove a custom control from the map.
#'
#' @param proxy       The map proxy object created by `mapProxy()`.
#' @param control_id  The ID of the custom control to remove.
#' @param panel_id    Optional. If provided, removes the custom control from the specified control panel.
#'                    If NULL, removes the standalone custom control.
#' @return            The map proxy object for chaining.
#' @export
#'
#' @examples
#' if (interactive()) {
#' # Add to a map
#' map() |>
#'  add_custom_control(
#'    id = "custom_control",
#'    html = "<p>I am a custom control</p>"
#' )
#' # In an observer
#' mapProxy("map") |>
#'  remove_custom_control("custom_control")
#'
#' # Add to a control panel
#' map() |>
#'  add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
#'  add_custom_control(
#'    id = "custom_control_panel",
#'    html = "<p>I am a custom control in a panel</p>",
#'    panel_id = "my_panel"
#'  )
#' # In an observer
#' mapProxy("map") |>
#'  remove_custom_control("custom_control", panel_id = "my_panel")
#' }
remove_custom_control <- function(proxy, control_id, panel_id = NULL) {
  if (!is.null(panel_id)) {
    # Remove from control panel
    remove_control_from_panel(proxy, panel_id, control_id)
  } else {
    # Remove standalone control
    remove_control(proxy, control_id)
  }
}


#' Add a cursor coordinates control to the map.
#'
#' @param map         The map or map proxy object.
#' @param position    The position of the cursor coordinates control on the map.
#'                    Default is `"bottom-left"`.
#'                    Options include "top-left", "top-right", "bottom-left", "bottom-right".
#' @param long_label  The label for the longitude coordinate. Default is `"Lng"`.
#' @param lat_label   The label for the latitude coordinate. Default is `"Lat"`.
#' @param panel_id    ID of control panel to add to (optional).
#' @param section_title Section title when added to a control panel.
#' @return            The map or map proxy object for chaining.
#' @export
#'
#' @examples
#' if (interactive()) {
#' # Add to a map
#' map() |>
#'  add_cursor_coords_control()
#'
#' # Change default options
#' map() |>
#'  add_cursor_coords_control(
#'    position = "top-right",
#'    long_label = "Longitude",
#'    lat_label = "Latitude"
#'  )
#'
#' # Add to a control panel
#' map() |>
#'  add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
#'  add_cursor_coords_control(panel_id = "my_panel", section_title = "Cursor Coordinates")
#'
#' # Add to a control panel inside a control group
#' map() |>
#'  add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
#'  add_control_group(
#'    panel_id = "my_panel",
#'    group_id = "map_state",
#'    group_title = "Map State"
#'    ) |>
#'  add_cursor_coords_control(panel_id = "my_panel", group_id = "map_state")
#' }
add_cursor_coords_control <- function(
  map,
  position = "bottom-left",
  long_label = "Lng",
  lat_label = "Lat",
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
) {
  control <- list(
    type = "cursor",
    position = position,
    longLabel = long_label,
    latLabel = lat_label,
    panelId = panel_id,
    panelTitle = section_title,
    groupId = group_id
  )

  if (inherits(map, "mapProxy")) {
    if (!is.null(panel_id)) {
      # Add to control panel
      add_control_to_panel(map, panel_id, "cursor", control, section_title, group_id)
    } else {
      # Add as standalone control
      map$session$sendCustomMessage("addCursorCoordsControl", list(id = map$id, control = control))
    }
  } else {
    if (is.null(map$x$cursorControls)) {
      map$x$cursorControls <- control
      map$x$controls <- c(map$x$controls, list(control))
    }
  }
  map
}


#' Remove the cursor coordinates control from the map.
#'
#' @param proxy     The map proxy object created by `mapProxy()`.
#' @param panel_id  Optional. If provided, removes the cursor coordinates control from the specified control panel.
#'                  If NULL, removes the standalone cursor coordinates control.
#' @return          The map proxy object for chaining.
#' @export
#'
#' @examples
#' if (interactive()) {
#' # Add to a map
#' map() |>
#'  add_cursor_coords_control()
#' # In an observer
#' mapProxy("map") |>
#'  remove_cursor_coords_control()
#'
#' # Add to a control panel
#' map() |>
#'  add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
#'  add_cursor_coords_control(panel_id = "my_panel")
#' # In an observer
#' mapProxy("map") |>
#'  remove_cursor_coords_control(panel_id = "my_panel")
#' }
remove_cursor_coords_control <- function(proxy, panel_id = NULL) {
  # Use the namespaced control ID pattern: cursor-coords-{mapId}
  control_id <- paste0("cursor-coords-", proxy$id)

  if (!is.null(panel_id)) {
    # Remove from control panel
    remove_control_from_panel(proxy, panel_id, control_id)
  } else {
    # Remove standalone control
    remove_control(proxy, control_id)
  }
}
