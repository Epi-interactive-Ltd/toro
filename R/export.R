#' Utilities for the map related to exports.
#'
#' Functions:
#' - `download_map_image`: Download the map as an image.

#' Download the map as an image.
#'
#' @note THIS IS A WIP !!!
#'
#' @param proxy    The map proxy object created by `mapProxy()`.
#' @param filename The name of the file to save the image as.
#' @param format   The format of the image. Default is "png".
#' @param width    The width of the image in pixels. Default is 800.
#' @param height   The height of the image in pixels. Default is 600.
#' @return         The map proxy object for chaining.
#' @export
download_map_image <- function(proxy, filename, format = "png", width = 800, height = 600) {
  message("!!! This function is a WIP !!!")
  if (!is.null(proxy$session)) {
    # saveWidget(widget, "widget.html", selfcontained = TRUE)
    proxy$session$sendCustomMessage(
      "downloadMapImage",
      list(id = proxy$id, filename = filename, format = format, width = width, height = height)
    )
  } else {
    warning("Cannot download map image outside of a Shiny session.")
  }
  proxy
}
