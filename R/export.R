#' Utilities for the map related to exports.

#' Export map as an image (non-Shiny context).
#'
#' This function exports a map widget as an image file using webshot2 or mapshot.
#' Works in non-Shiny contexts like RMarkdown, scripts, or interactive sessions.
#'
#' @param map      A map object created by `map()`.
#' @param filepath The file path to save the image (including extension).
#' @param width    The width of the image in pixels. Default is 800.
#' @param height   The height of the image in pixels. Default is 600.
#' @param delay    The delay in seconds before capturing. Default is 2.
#' @param zoom     The zoom factor for the capture. Default is 1.
#' @param ...      Additional arguments passed to webshot2::webshot() or mapshot().
#' @return         The file path of the saved image (invisibly).
#' @export
#' @examples
#' \dontrun{
#' # Create and export a map
#' my_map <- map() |>
#'   add_source("earthquakes", quakes_data) |>
#'   add_circle_layer("quake_circles", source = "earthquakes")
#'
#' export_map_image(my_map, "earthquake_map.png", width = 1200, height = 800)
#' }
export_map_image <- function(
  map,
  filepath,
  width = 800,
  height = 600,
  delay = 2,
  zoom = 1,
  ...
) {
  # Check if required packages are available
  if (!requireNamespace("htmlwidgets", quietly = TRUE)) {
    stop("htmlwidgets package is required for export_map_image()")
  }

  # Try webshot2 first, then mapshot, then webshot
  webshot_pkg <- NULL
  if (requireNamespace("webshot2", quietly = TRUE)) {
    webshot_pkg <- "webshot2"
  } else if (requireNamespace("mapshot", quietly = TRUE)) {
    webshot_pkg <- "mapshot"
  } else if (requireNamespace("webshot", quietly = TRUE)) {
    webshot_pkg <- "webshot"
  } else {
    stop(
      "Please install one of: webshot2, mapshot, or webshot packages for non-Shiny image export"
    )
  }

  # Create temporary HTML file
  temp_html <- tempfile(fileext = ".html")
  on.exit(unlink(temp_html), add = TRUE)

  # Save widget as HTML
  htmlwidgets::saveWidget(map, temp_html, selfcontained = TRUE)

  # Capture image based on available package
  if (webshot_pkg == "webshot2") {
    webshot2::webshot(
      url = temp_html,
      file = filepath,
      vwidth = width,
      vheight = height,
      delay = delay,
      zoom = zoom,
      ...
    )
  } else if (webshot_pkg == "mapshot") {
    mapshot::mapshot(
      x = map,
      file = filepath,
      vwidth = width,
      vheight = height,
      delay = delay,
      zoom = zoom,
      ...
    )
  } else {
    webshot::webshot(
      url = temp_html,
      file = filepath,
      vwidth = width,
      vheight = height,
      delay = delay,
      zoom = zoom,
      ...
    )
  }

  message("Map exported to: ", filepath)
  invisible(filepath)
}

#' Save map as standalone HTML file.
#'
#' This function saves a map widget as a self-contained HTML file that can be
#' opened in any web browser.
#'
#' @param map      A map object created by `map()`.
#' @param filepath The file path to save the HTML file (should end with .html).
#' @param title    The title for the HTML page. Default is "Toro Map".
#' @param selfcontained Whether to create a self-contained HTML file. Default is TRUE.
#' @param ...      Additional arguments passed to htmlwidgets::saveWidget().
#' @return         The file path of the saved HTML file (invisibly).
#' @export
#' @examples
#' \dontrun{
#' # Create and save a map as HTML
#' my_map <- map() |>
#'   add_source("earthquakes", quakes_data) |>
#'   add_circle_layer("quake_circles", source = "earthquakes")
#'
#' save_map_html(my_map, "earthquake_map.html", title = "Earthquake Data")
#' }
save_map_html <- function(
  map,
  filepath,
  title = "Toro Map",
  selfcontained = TRUE,
  ...
) {
  if (!requireNamespace("htmlwidgets", quietly = TRUE)) {
    stop("htmlwidgets package is required for save_map_html()")
  }

  # Ensure filepath ends with .html
  if (!grepl("\\.html?$", filepath, ignore.case = TRUE)) {
    filepath <- paste0(filepath, ".html")
  }

  htmlwidgets::saveWidget(
    widget = map,
    file = filepath,
    title = title,
    selfcontained = selfcontained,
    ...
  )

  message("Map saved as HTML to: ", filepath)
  invisible(filepath)
}
