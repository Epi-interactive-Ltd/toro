#' Get layout options for a specific layer type
#'
#' This function returns a list of layout options based on the layer type and any additional
#' options provided.
#'
#' @param layer_type  A string indicating the type of layer (e.g., "fill", "circle", "line").
#' @param options     A list of additional options to customize the layout properties.
#' @returns           A list of layout options suitable for the specified layer type.
#' @seealso \code{\link{get_column}}, \code{\link{get_column_group}},
#'          \code{\link{get_column_step_colours}}
#' @examples
#' get_layout_options("line", list(line_cap = "butt", line_join = "bevel"))
#' get_layout_options("symbol", list(icon_image = "yellow_pin", icon_size = 1.5))
#' # For horizontal flipping, provide left/right versions of your icon or use rotation fallback
#' get_layout_options("symbol", list(icon_image = "arrow", icon_flip_horizontal = TRUE))
#'
#' @export
get_layout_options <- function(layer_type, options = list()) {
  default_options <- list(
    line_cap = "round",
    line_join = "round",
    icon_image = "",
    icon_size = 1,
    icon_anchor = "bottom",
    icon_offset = list(0, 0),
    icon_allow_overlap = TRUE,
    icon_rotate = 0,
    icon_flip_horizontal = FALSE,
    text_font = "Open Sans Regular",
    text_field = NULL,
    text_size = 12
  )
  merged_options <- utils::modifyList(default_options, options)
  layout_options <- structure(list(), names = character(0))
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
    layout_options[["icon-rotate"]] <- merged_options$icon_rotate
    layout_options[["icon-flip-horizontal"]] <- merged_options$icon_flip_horizontal
    layout_options[["text-font"]] <- list(merged_options$text_font)
    layout_options[["text-size"]] <- merged_options$text_size
    if (!is.null(merged_options$text_field)) {
      layout_options[["text-field"]] <- merged_options$text_field
    }
  }
  return(layout_options)
}

#' Get paint options for a specific layer type
#'
#' This function returns a list of paint options based on the layer type and any
#' additional options provided.
#'
#' @param layer_type  A string indicating the type of layer (e.g., "fill", "circle", "line").
#' @param options     A list of additional options to customize the paint properties.
#' @returns           A list of paint options suitable for the specified layer type.
#' @seealso \code{\link{get_column}}, \code{\link{get_column_group}},
#'          \code{\link{get_column_step_colours}}
#' @examples
#' get_paint_options("line", list(colour = "blue", opacity = 0.8, line_width = 2))
#' get_paint_options("circle", list(colour = "red", circle_radius = 10, outline_colour = "black"))
#' # Use with get_column for data-driven styling:
#' get_paint_options("fill", list(colour = get_column("color"), opacity = get_column("opacity")))
#' get_paint_options("fill", list(
#'    colour = get_column_group("group", c("A" = "green", "B" = "blue"))
#' ))
#' get_paint_options("fill", list(
#'    opacity = get_column_step_colours("percent", c(25, 75), c("red", "orange", "yellow"))
#' ))
#'
#' @export
get_paint_options <- function(layer_type, options = list()) {
  default_options <- list(
    colour = "grey",
    opacity = 1,
    outline_colour = "grey",
    outline_opacity = 1,
    line_width = 1,
    circle_radius = 5,
    line_dash = list(0, 1) # No dash by default
  )
  merged_options <- utils::modifyList(default_options, options)
  paint_options <- structure(list(), names = character(0))
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
    paint_options[["line-dasharray"]] <- merged_options$line_dash
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

#' Get a filter for a layer
#'
#' Parse a filter string into a list of filters that the map can use.
#'
#' @param filter_str  A string or vector of strings representing the filter conditions.
#' @returns           A list where the first element is "all" if multiple filters are provided,
#'                    or a single filter condition.
#' @examples
#' get_layer_filter("layer_id == forests")
#' get_layer_filter(c("layer_id == sites", "project_status == Confirmed"))
#'
#' @export
get_layer_filter <- function(filter_str) {
  filter_str <- as.character(filter_str)

  parse_one_filter <- function(str) {
    # Remove spaces for easier parsing
    str <- gsub("\\s+", "", str)
    # Match operator and split
    matches <- regmatches(str, regexec("(.+?)(==|!=|>=|<=|>|<)(.+)", str))[[1]]
    if (length(matches) == 4) {
      list(matches[3], matches[2], matches[4])
    } else {
      message("Invalid filter string", str)
    }
  }
  filters <- lapply(filter_str, parse_one_filter)
  if (length(filters) > 1) {
    return(list("all", filters[[1]]))
  }
  return(filters[[1]])
}
