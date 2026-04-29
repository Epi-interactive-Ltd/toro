#' Check if Chrome/Chromium is available for webshot operations
#'
#' @return `TRUE` if Chrome is available, `FALSE` otherwise.
#' @keywords internal
check_chrome_available <- function() {
  # Check if CHROMOTE_CHROME environment variable is set
  chrome_env <- Sys.getenv("CHROMOTE_CHROME", unset = "")
  if (chrome_env != "" && file.exists(chrome_env)) {
    return(TRUE)
  }

  # Common Chrome paths on different systems
  chrome_paths <- c(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", # macOS
    "/Applications/Chromium.app/Contents/MacOS/Chromium", # macOS Chromium
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser", # macOS Brave
    "/usr/bin/google-chrome", # Linux
    "/usr/bin/chromium-browser", # Linux
    "/usr/bin/brave-browser" # Linux Brave
  )

  # Check if any of the common paths exist
  any(file.exists(chrome_paths))
}

#' Provide helpful error message for missing Chrome
#' @return No return value, prints to console.
#' @keywords internal
chrome_error_message <- function() {
  os_type <- Sys.info()[["sysname"]]

  if (os_type == "Darwin") {
    # macOS
    paste0(
      "Google Chrome (or a Chromium-based browser) is required for map image export.\n\n",
      "Solutions:\n",
      "1. Install Google Chrome from: https://www.google.com/chrome/\n",
      "2. Or install Brave from: https://brave.com/\n",
      "3. Or set the CHROMOTE_CHROME environment variable:\n",
      "   Sys.setenv(CHROMOTE_CHROME = \"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome\")\n\n",
      "Then try your export_map_image() call again."
    )
  } else {
    # Linux/Windows
    paste0(
      "Google Chrome (or a Chromium-based browser) is required for map image export.\n\n",
      "Solutions:\n",
      "1. Install Google Chrome or Chromium browser\n",
      "2. Set the CHROMOTE_CHROME environment variable to your browser executable:\n",
      "   Sys.setenv(CHROMOTE_CHROME = \"/path/to/your/browser\")\n\n",
      "Then try your export_map_image() call again."
    )
  }
}

#' Export map as an image (non-Shiny context)
#'
#' This function exports a map widget as an image file using webshot2 or mapview.
#' Works in non-Shiny contexts like RMarkdown, scripts, or interactive sessions.
#'
#' @param map A map object created by `map()`.
#' @param filepath The file path to save the image (including extension).
#' @param width The width of the image in pixels. Default is 800.
#' @param height The height of the image in pixels. Default is 600.
#' @param delay The delay in seconds before capturing. Default is 2.
#' @param zoom The zoom factor for the capture. Default is 1.
#' @param ... Additional arguments passed to `webshot2::webshot()` or `mapview::mapshot()`.
#' @return The file path of the saved image (invisibly).
#' @export
#'
#' @examples
#' \donttest{
#' # Load library
#' library(sf)
#'
#' data <- data.frame(lon = 174.8210, lat = -41.3096) |>
#'   sf::st_as_sf(coords = c("lon", "lat"), crs = 4326)
#' # Create and export a map
#' my_map <- map() |>
#'   add_circle_layer("epi_circle", source = data)
#'
#' export_map_image(my_map, "my_map.png", width = 1200, height = 800)
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

  # Try webshot2 first, then mapview, then webshot
  webshot_pkg <- NULL
  if (requireNamespace("webshot2", quietly = TRUE)) {
    webshot_pkg <- "webshot2"
  } else if (requireNamespace("mapview", quietly = TRUE)) {
    webshot_pkg <- "mapview"
  } else if (requireNamespace("webshot", quietly = TRUE)) {
    webshot_pkg <- "webshot"
  } else {
    stop(
      "Please install one of: webshot2, mapview, or webshot packages for non-Shiny image export"
    )
  }

  # Check if Chrome is available (required by webshot packages)
  if (!check_chrome_available()) {
    stop(chrome_error_message(), call. = FALSE)
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
  } else if (webshot_pkg == "mapview") {
    mapview::mapshot(
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

#' Save map as standalone HTML file
#'
#' This function saves a map widget as a self-contained HTML file that can be
#' opened in any web browser.
#'
#' @param map A map object created by `map()`.
#' @param filepath The file path to save the HTML file (should end with .html).
#' @param title The title for the HTML page. Default is "Toro Map".
#' @param selfcontained Whether to create a self-contained HTML file. Default is TRUE.
#' @param ... Additional arguments passed to `htmlwidgets::saveWidget()`.
#' @return The file path of the saved HTML file (invisibly).
#' @export
#'
#' @examples
#' \donttest{
#' # Load library
#' library(sf)
#'
#' data <- data.frame(lon = 174.8210, lat = -41.3096) |>
#'   sf::st_as_sf(coords = c("lon", "lat"), crs = 4326)
#' # Create and export a map
#' my_map <- map() |>
#'   add_circle_layer("epi_circle", source = data)
#'
#' save_map_html(my_map, "my_map")
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
