#' Get paint options for a specific layer type
#'
#' This function returns a list of paint options based on the layer type and any
#' additional options provided.
#'
#' @param layer_type  A string indicating the type of layer (e.g., "fill", "circle", "line").
#' @param options     A list of additional options to customize the paint properties.
#' @returns           A list of paint options suitable for the specified layer type.
#' @seealso \code{\link{getColumn}}, \code{\link{getColumnGroupValues}},
#'          \code{\link{getColumnStepColours}}
#' @examples
#' getPaintOptions("line", list(colour = "blue", opacity = 0.8, line_width = 2))
#' getPaintOptions("circle", list(colour = "red", circle_radius = 10, outline_colour = "black"))
#' # Use with getColumn for data-driven styling:
#' getPaintOptions("fill", list(colour = getColumn("color"), opacity = getColumn("opacity")))
#' getPaintOptions("fill", list(
#'    colour = getColumnGroupValues("group", c("A" = "green", "B" = "blue")
#' ))
#' getPaintOptions("fill", list(
#'    opacity = getColumnStepColours("percent", c(25, 75), c("red", "orange", "yellow"))
#' ))
#'
#' @export
getPaintOptions <- function(layer_type, options = list()) {
  default_options <- list(
    colour = "grey",
    opacity = 1,
    outline_colour = "grey",
    outline_opacity = 1,
    line_width = 1,
    circle_radius = 5
  )
  merged_options <- utils::modifyList(default_options, options)
  paint_options <- list()
  if (layer_type %in% c("fill", "circle", "line")) {
    paint_options[[paste0(layer_type, "-color")]] <- merged_options$colour
    paint_options[[paste0(layer_type, "-opacity")]] <- merged_options$opacity
  }
  if (layer_type == "circle") {
    paint_options[["circle-radius"]] <- merged_options$circle_radius
    paint_options[["circle-stroke-color"]] <- merged_options$outline_colour
    paint_options[["circle-stroke-opacity"]] <- merged_options$outline_opacity
    paint_options[["circle-stroke-width"]] <- merged_options$line_width
  }
  if (layer_type == "line") {
    paint_options[["line-width"]] <- merged_options$line_width
  }
  if (layer_type == "fill") {
    paint_options[["fill-outline-color"]] <- merged_options$outline_colour
  }
  if (layer_type == "symbol") {
    paint_options[["icon-opacity"]] <- merged_options$opacity
    paint_options[["text-color"]] <- merged_options$colour
  }
  return(paint_options)
}
