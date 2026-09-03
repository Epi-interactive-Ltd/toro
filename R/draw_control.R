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
#'    Options include "polygon", "delete", "line", "circle", "freehand", and "point".
#' @param active_colour The colour for the drawn shapes. Default is `"#04AAC1"`.
#' @param inactive_colour The colour for the inactive shapes. Default is `"#04AAC1"`.
#' @param mode_labels A named list of labels for each mode.
#'    For example, `list(polygon = "Draw Polygon", delete = "Delete Shape")`.
#' @param features Optional. An `sf` object or GeoJSON string of pre-drawn shapes to
#'    populate the draw control with on initialisation.
#' @return The map or map proxy object for chaining.
#' @export
#'
#' @seealso [get_drawn_shape()] to retrieve the drawn shape as an `sf` object in Shiny.
#'
#' @example inst/examples/draw-control.R
add_draw_control <- function(
  map,
  id = "draw_control",
  position = "top-right",
  modes = c("polygon"),
  active_colour = "#04AAC1",
  inactive_colour = "#04AAC1",
  mode_labels = list(),
  features = NULL,
  config = list()
) {
  # Convert sf or GeoJSON string to a plain list for JSON serialisation
  if (!is.null(features)) {
    features <- .normalise_draw_geometry(features)

    if (inherits(features, "sf") || inherits(features, "sfc")) {
      features <- geojsonsf::sf_geojson(features, atomise = FALSE)
    }
    if (is.character(features)) {
      features <- jsonlite::fromJSON(features, simplifyVector = FALSE)
    }
  }

  default_config <- list(
    # editable = FALSE, # This is not currently supported
    direction = "v"
  )
  draw_config <- utils::modifyList(default_config, config)

  control <- list(
    type = "draw",
    controlId = id,
    position = position,
    modes = list(modes),
    activeColour = active_colour,
    inactiveColour = inactive_colour,
    modeLabels = mode_labels,
    features = features,
    config = draw_config
  )

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "addDraw",
      list(id = map$id, options = control)
    )
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
#' @param id Optional ID of the draw control to remove. Default is `"draw_control"`.
#' @return The map proxy object for chaining.
#' @export
#'
#' @example inst/examples/draw-control.R
remove_draw_control <- function(proxy, id = "draw_control") {
  if (inherits(proxy, "mapProxy")) {
    proxy$session$sendCustomMessage(
      "removeDraw",
      list(id = proxy$id, controlId = id)
    )
  }
  proxy
}

#' Toggle the visibility of the draw control on a map
#'
#' @param proxy The map proxy object created by `mapProxy()`.
#' @param show Logical indicating whether to show or hide the control. Default is `TRUE`.
#' @param id Optional ID of the draw control to remove. Default is `"draw_control"`.
#' @return The map proxy object for chaining.
#' @export
#'
#' @example inst/examples/draw-control.R
toggle_draw_control <- function(proxy, show = TRUE, id = "draw_control") {
  if (inherits(proxy, "mapProxy")) {
    proxy$session$sendCustomMessage(
      ifelse(show, "showDrawControl", "hideDrawControl"),
      list(id = proxy$id, controlId = id)
    )
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
#' @example inst/examples/draw-control.R
delete_drawn_shape <- function(proxy, shape_id, draw_control_id = "draw_control") {
  proxy$session$sendCustomMessage(
    "deleteDrawnShape",
    list(id = proxy$id, shapeId = shape_id, controlId = draw_control_id)
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
#' @example inst/examples/draw-control.R
update_drawn_shape <- function(proxy, shape_id, new_geometry, draw_control_id = "draw_control") {
  new_geometry <- .normalise_draw_geometry(new_geometry, shape_id = shape_id)

  proxy$session$sendCustomMessage(
    "updateDrawnShape",
    list(id = proxy$id, geometry = new_geometry, controlId = draw_control_id, shapeId = shape_id)
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
#' @example inst/examples/draw-control.R
add_drawn_shape <- function(proxy, new_geometry, draw_control_id = "draw_control") {
  new_geometry <- .normalise_draw_geometry(new_geometry)

  proxy$session$sendCustomMessage(
    "addDrawnShape",
    list(id = proxy$id, geometry = new_geometry, controlId = draw_control_id)
  )
  proxy
}

#' Normalise the geometry input for adding/updating drawn shapes.
#'
#' @keywords internal
#' @noRd
.normalise_draw_geometry <- function(features, shape_id = NULL) {
  features <- .fix_feature(features)

  if (inherits(features, c("sf", "data.frame", "tbl"))) {
    features <- .validate_source_data(features)
  }

  if (is.character(features)) {
    features <- jsonlite::fromJSON(features, simplifyVector = FALSE)
  }

  if (!is.list(features) || is.null(features$type)) {
    stop("new_geometry must be a GeoJSON Feature or FeatureCollection")
  }

  if (!is.null(shape_id)) {
    shape_id <- as.character(shape_id[[1]])
  }

  .clean_feature <- function(feature) {
    if (is.null(feature$id) && !is.null(feature$properties$id)) {
      feature$id <- feature$properties$id
    }

    # Terra draw does not accept coordinates with more than 9 decimal places
    feature$geometry$coordinates <- rapply(
      feature$geometry$coordinates,
      round,
      classes = "numeric",
      how = "replace",
      digits = 9
    )

    feature
  }

  if (identical(features$type, "FeatureCollection")) {
    feats <- features$features
    if (is.null(feats)) {
      feats <- list()
    }

    feats <- lapply(feats, .clean_feature)

    # update_drawn_shape should target a single existing feature id
    if (!is.null(shape_id) && length(feats) == 1) {
      feats[[1]]$id <- shape_id
    }

    features$features <- feats
    return(features)
  }

  if (identical(features$type, "Feature")) {
    features <- .clean_feature(features)
    if (!is.null(shape_id)) {
      features$id <- shape_id
    }
    return(features)
  }

  stop("new_geometry must be a GeoJSON Feature or FeatureCollection")
}

.fix_feature <- function(geometry) {
  if (nrow(geometry) == 0) {
    return(geometry)
  }
  features <- lapply(seq_len(nrow(geometry)), function(i) {
    geom <- geometry[i, ]
    geom_type <- sf::st_geometry_type(geom)

    if (geom_type %in% c("MULTIPOLYGON", "MULTILINESTRING")) {
      converting_to <- ""
      extra_message <- ""
      # Remove all other columns to get rid of a warning about attribution duplication
      info <- sf::st_drop_geometry(geom)
      # Need to convert it to a polygon for terra draw to be able to handle it
      geom <- geom |>
        dplyr::select(geometry)

      if (geom_type == "MULTIPOLYGON") {
        converting_to <- "POLYGON"
        geom <- geom |>
          # Multi-polygon first to standardise the data
          sf::st_cast("MULTIPOLYGON") |>
          sf::st_cast("POLYGON")
      } else if (geom_type == "MULTILINESTRING") {
        converting_to <- "LINESTRING"
        geom <- geom |>
          # Multi-polygon first to standardise the data
          sf::st_cast("MULTILINESTRING") |>
          sf::st_cast("LINESTRING")
      }

      geom <- cbind(geom, info)

      if (nrow(geom) > 1) {
        # Draw can only handle a feature for each shape
        if (geom_type == "MULTIPOLYGON") {
          # By default get the largest polygon
          geom <- geom |>
            mutate(toro_draw_size = sf::st_area(geometry))
        } else if (geom_type == "MULTILINESTRING") {
          # By default get the longest line
          geom <- geom |>
            mutate(toro_draw_size = sf::st_length(geometry))
        } else {
          # Otherwise, just get the first row
          geom$toro_draw_size <- 0
          geom$toro_draw_size[1] <- 1
        }
        geom <- geom |>
          slice_max(toro_draw_size, n = 1) |>
          select(-toro_draw_size)
        extra_message <- paste(
          "\n The conversion has resulted in multiple features, only the largest will be kept."
        )
      }

      warning(paste(
        "The geometry being added is of type",
        geom_type,
        "which is not an accepted type (POLYGON, POINT, LINESTRING), attempting conversion to",
        converting_to,
        extra_message
      ))
    }

    return(geom)
  })
  do.call(rbind, features)
}
