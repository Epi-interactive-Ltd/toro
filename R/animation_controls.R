#' Functions related to animation controls.
#'
#' Functions:
#' - add_timeline_control:    Add a timeline control to the map or control panel.
#' - remove_timeline_control: Remove the timeline control from the map.
#' - add_speed_control:       Add a speed control to the map or control panel.
#' - remove_speed_control:    Remove the speed control from the map.

#' Add a timeline control to the map or control panel
#'
#' @param map           The map or map proxy object.
#' @param start_date    Start date for the timeline (YYYY-MM-DD format).
#' @param end_date      End date for the timeline (YYYY-MM-DD format).
#' @param position      Position on the map if not using a control panel. Default is "bottom-left".
#' @param max_ticks     Maximum number of labeled ticks to prevent overlap. Default is 3.
#' @param panel_id      ID of control panel to add to (optional).
#' @param section_title Section title when added to a control panel.
#' @return              The map or map proxy object for chaining.
#' @export
#' 
#' @examples
#' if (interactive()) {
#' # Add to a map (no dates specified)
#' map() |>
#'  add_timeline_control()
#'
#' # Add to map with dates
#' map() |>
#'  add_timeline_control(
#'    start_date = Sys.Date(),
#'    end_date = Sys.Date() + 30
#'  )
#'
#' # Add to a control panel
#' map() |>
#'  add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
#'  add_timeline_control(
#'    start_date = Sys.Date(),
#'    end_date = Sys.Date() + 30,
#'    panel_id = "my_panel"
#'  )
#'
#' # Add to a control panel inside a control group
#' map() |>
#'  add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
#'  add_control_group(
#'    panel_id = "my_panel",
#'    group_id = "animation_controls",
#'    group_title = "Animation Controls"
#'  ) |>
#'  add_timeline_control(
#'    start_date = Sys.Date(),
#'    end_date = Sys.Date() + 30,
#'    panel_id = "my_panel",
#'    group_id = "animation_controls"
#'  )
#' }
add_timeline_control <- function(
  map,
  start_date = NULL,
  end_date = NULL,
  position = "bottom-left",
  max_ticks = 3,
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
) {
  # Use default dates if not provided
  # if (is.null(start_date)) {
  #   start_date <- Sys.Date()
  # }
  # if (is.null(end_date)) {
  #   end_date <- Sys.Date() + 365
  # }

  options <- list(
    startDate = as.character(start_date),
    endDate = as.character(end_date),
    position = position,
    maxTicks = max_ticks,
    useControlPanel = !is.null(panel_id),
    panelId = panel_id,
    panelTitle = section_title,
    groupId = group_id
  )

  if (inherits(map, "mapProxy")) {
    if (!is.null(panel_id)) {
      # Add to control panel
      add_control_to_panel(map, panel_id, "timeline", options, section_title, group_id)
    } else {
      # Add as standalone control
      map$session$sendCustomMessage(
        "addTimelineControlStandalone",
        list(id = map$id, options = options)
      )
    }
  } else {
    # Store for initial map creation
    if (is.null(map$x$timelineControls)) {
      map$x$timelineControls <- list()
    }
    control_id <- if (!is.null(panel_id)) paste0(panel_id, "_timeline") else "standalone_timeline"
    map$x$timelineControls[[control_id]] <- options
  }

  map
}

#' Remove the timeline control from the map.
#'
#' @param proxy     The map proxy object created by `mapProxy()`.
#' @param panel_id  Optional. If provided, removes the timeline control from the specified control panel.
#'                  If NULL, removes the standalone timeline control.
#' @return          The map proxy object for chaining.
#' @export
#' 
#' @examples
#' if (interactive()) {
#' # Add to a map
#' map() |>
#'  add_timeline_control()
#' # In an observer
#' mapProxy("map") |>
#'  remove_timeline_control()
#'
#' # Add to a control panel
#' map() |>
#'  add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
#'  add_timeline_control(panel_id = "my_panel")
#' # In an observer
#' mapProxy("map") |>
#'  remove_timeline_control(panel_id = "my_panel")
#' }
remove_timeline_control <- function(proxy, panel_id = NULL) {
  # Use the namespaced control ID pattern: timeline-control-{mapId}
  control_id <- paste0("timeline-control-container-", proxy$id)

  if (!is.null(panel_id)) {
    # Remove from control panel
    remove_control_from_panel(proxy, panel_id, control_id)
  } else {
    # Remove standalone control
    remove_control(proxy, control_id)
  }
}


#' Add a speed control to the map or control panel
#'
#' @param map           The map or map proxy object.
#' @param values        Vector of speed multiplier values. Default is c(0.5, 1, 2).
#' @param labels        Vector of labels for each speed value. Default is c("Slow", "Normal", "Fast").
#' @param default_index Index of the default speed (1-based). Default is 2.
#' @param position      Position on the map if not using a control panel. Default is "top-right".
#' @param panel_id      ID of control panel to add to (optional).
#' @param section_title Section title when added to a control panel.
#' @return              The map or map proxy object for chaining.
#' @export
#' 
#' @examples
#' if (interactive()) {
#' # Add to a map (no dates specified)
#' map() |>
#'  add_speed_control()
#'
#' # Change default options
#' map() |>
#'  add_speed_control(
#'    values = c(0.5, 1, 2, 5),
#'    labels = c("Slow", "Normal", "Fast", "Super fast"),
#'    default_index = 4 # Start on Super fast
#'  )
#'
#' # Add to a control panel
#' map() |>
#'  add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
#'  add_speed_control(panel_id = "my_panel")
#'
#' # Add to a control panel inside a control group
#' map() |>
#'  add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
#'  add_control_group(
#'    panel_id = "my_panel",
#'    group_id = "animation_controls",
#'    group_title = "Animation Controls"
#'  ) |>
#'  add_speed_control(
#'    panel_id = "my_panel",
#'    group_id = "animation_controls"
#'  )
#' }
add_speed_control <- function(
  map,
  values = c(0.5, 1, 2),
  labels = c("Slow", "Normal", "Fast"),
  default_index = 2,
  position = "top-right",
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
) {
  options <- list(
    values = values,
    labels = labels,
    defaultIndex = default_index - 1, # Convert to 0-based index for JS
    position = position,
    useControlPanel = !is.null(panel_id),
    panelId = panel_id,
    panelTitle = section_title,
    groupId = group_id
  )

  if (inherits(map, "mapProxy")) {
    if (!is.null(panel_id)) {
      # Add to control panel
      add_control_to_panel(map, panel_id, "speed", options, section_title, group_id)
    } else {
      # Add as standalone control
      map$session$sendCustomMessage(
        "addSpeedControlStandalone",
        list(id = map$id, options = options)
      )
    }
  } else {
    # Store for initial map creation
    if (is.null(map$x$speedControls)) {
      map$x$speedControls <- list()
    }
    control_id <- if (!is.null(panel_id)) paste0(panel_id, "_speed") else "standalone_speed"
    map$x$speedControls[[control_id]] <- options
  }

  map
}

#' Remove the speed control from the map.
#'
#' @param proxy     The map proxy object created by `mapProxy()`.
#' @param panel_id  Optional. If provided, removes the speed control from the specified control panel.
#'                  If NULL, removes the standalone speed control.
#' @return          The map proxy object for chaining.
#' @export
#' 
#' @examples
#' if (interactive()) {
#' # Add to a map
#' map() |>
#'  add_speed_control()
#' # In an observer
#' mapProxy("map") |>
#'  remove_speed_control()
#'
#' # Add to a control panel
#' map() |>
#'  add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
#'  add_speed_control(panel_id = "my_panel")
#' # In an observer
#' mapProxy("map") |>
#'  remove_speed_control(panel_id = "my_panel")
#' }
remove_speed_control <- function(proxy, panel_id = NULL) {
  # Use the namespaced control ID pattern: speed-control-{mapId}
  control_id <- paste0("speed-control-", proxy$id)

  if (!is.null(panel_id)) {
    # Remove from control panel
    remove_control_from_panel(proxy, panel_id, control_id)
  } else {
    # Remove standalone control
    remove_control(proxy, control_id)
  }
}
