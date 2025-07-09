#' Get layout options for a specific layer type
#'
#' This function returns a list of layout options based on the layer type and any additional
#' options provided.
#'
#' @param layer_type  A string indicating the type of layer (e.g., "fill", "circle", "line").
#' @param options     A list of additional options to customize the layout properties.
#' @returns           A list of layout options suitable for the specified layer type.
#' @seealso \code{\link{getColumn}}, \code{\link{getColumnGroupColours}},
#'          \code{\link{getColumnStepColours}}
#' @examples
#' getLayoutOptions("line", list(line_cap = "butt", line_join = "bevel"))
#' getLayoutOptions("symbol", list(icon_image = "yellow_pin", icon_size = 1.5))
#'
#' @export
getLayoutOptions <- function(layer_type, options = list()) {
  default_options <- list(
    line_cap = "round",
    line_join = "round",
    icon_image = "",
    icon_size = 1,
    icon_anchor = "bottom",
    icon_offset = list(0, 0),
    icon_allow_overlap = TRUE,
    text_font = "Open Sans Regular",
    text_field = NULL,
    text_size = 12
  )
  merged_options <- utils::modifyList(default_options, options)
  layout_options <- list()
  if (layer_type == "line") {
    layout_options[["line-cap"]] <- merged_options$line_cap
    layout_options[["line-join"]] <- merged_options$line_join
  }
  if (layer_type == "symbol") {
    layout_options[["icon-allow-overlap"]] <- merged_options$icon_allow_overlap
    layout_options[["icon-image"]] <- merged_options$icon_image
    layout_options[["icon-size"]] <- merged_options$icon_size
    layout_options[["icon-anchor"]] <- merged_options$icon_anchor
    layout_options[["icon-offset"]] <- merged_options$icon_offset
    layout_options[["text-font"]] <- list(merged_options$text_font)
    layout_options[["text-size"]] <- merged_options$text_size
    if (!is.null(merged_options$text_field)) {
      layout_options[["text-field"]] <- merged_options$text_field
    }
  }
  return(layout_options)
}
