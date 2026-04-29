#' Get layout options for a specific layer type
#'
#' This function returns a list of layout options based on the layer type and any additional
#' options provided.
#'
#' @note You can provide any layout options found in the
#' [MapLibre Layers docs](https://maplibre.org/maplibre-style-spec/layers/) in the `options`
#' argument, and they will be included in the returned list.
#' The default options are just a starting point and can be overridden by providing them in the
#' `options` argument.
#'
#' @param layer_type A string indicating the type of layer (e.g., "fill", "circle", "line").
#' @param options A list of additional options to customize the layout properties.
#'    See MapLibre docs for options.
#'    \itemize{
#'      \item line_cap: A list of options for the line cap, if `layer_type` is "line".
#'        Default is "round".
#'      \item line_join: A list of options for the line join, if `layer_type` is "line".
#'        Default is "round".
#'      \item icon_image: The name of the icon image to use for symbol layers, if `layer_type` is
#'        "symbol". Default is "toro-pin".
#'      \item icon_size: The size of the icon for symbol layers, if `layer_type` is "symbol".
#'        Default is 1.
#'      \item icon_anchor: The anchor point for the icon in symbol layers, if `layer_type` is
#'        "symbol". Default is "bottom".
#'      \item text_anchor: The anchor point for the text in symbol layers, if `layer_type` is
#'        "symbol". Default is "center".
#'      \item icon_offset: The offset for the icon in symbol layers, if `layer_type` is "symbol".
#'        Default is list(0, 0).
#'      \item icon_allow_overlap: Whether to allow icons to overlap in symbol layers, if
#'        `layer_type` is "symbol". Default is `TRUE.`
#'      \item text_allow_overlap: Whether to allow text to overlap in symbol layers, if `layer_type`
#'        is "symbol". Default is `TRUE`
#'      \item icon_rotate: The rotation angle for icons in symbol layers, if `layer_type` is
#'        "symbol". Default is 0.
#'      \item icon_flip_horizontal: Whether to flip icons horizontally in symbol layers, if
#'        `layer_type` is "symbol". Default is FALSE. Note that this uses the `icon-flip-horizontal`
#'        property in MapLibre, which may not be supported by all icons.
#'      \item text_font: The font for text in symbol layers, if `layer_type` is "symbol". Default is
#'        "Open Sans Regular".
#'      \item text_field: The text field for symbol layers, if `layer_type` is "symbol". Default is
#'        `NULL`, which means no text will be shown. This can be set to a column value using
#'        `get_column()` or other functions to show text from the data.
#'      \item text_size: The size of the text in symbol layers, if `layer_type` is "symbol".
#'        Default is 12.
#'      You can also provide any other layout options found in the MapLibre docs for the specific
#'        layer type, and they will be included in the returned list.
#'    }
#' @return A list of layout options suitable for the specified layer type.
#' @export
#' @seealso [get_column()] for getting options from column values directly, [get_column_group()] for
#'   getting options by spiliting column values into groups, and [get_column_steps()] for
#'   getting options by spiliting column values into groups based on steps.
#'
#' @examples
#' get_layout_options("line", list(line_cap = "butt", line_join = "bevel"))
#'
#' get_layout_options("symbol", list(icon_image = "yellow_pin", icon_size = 1.5))
#'
#' # For horizontal flipping, provide left/right versions of your icon or use rotation fallback
#' get_layout_options("symbol", list(icon_image = "arrow", icon_flip_horizontal = TRUE))
#'
#' # Provide options outside of the defaults
#' get_layout_options(
#'  "circle",
#'  list(
#'    "circle-sort-key" = get_column_steps(
#'      "elevation",
#'      c(3000),
#'      c(100, 200)
#'    )
#'  )
#' )
get_layout_options <- function(layer_type, options = list()) {
  default_options <- list(
    line_cap = "round",
    line_join = "round",
    icon_image = "toro-pin",
    icon_size = 1,
    icon_anchor = "bottom",
    text_anchor = "center",
    icon_offset = list(0, 0),
    icon_allow_overlap = TRUE,
    text_allow_overlap = TRUE,
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
    layout_options[["text-font"]] <- list(merged_options$text_font)
    layout_options[["text-size"]] <- merged_options$text_size

    if (merged_options$icon_flip_horizontal) {
      # Use a rotation of 180 degrees as a simple way to flip horizontally
      layout_options[[
        "icon-flip-horizontal"
      ]] <- merged_options$icon_flip_horizontal
    }
    if (!is.null(merged_options$text_field)) {
      layout_options[["text-field"]] <- merged_options$text_field
    }
  }
  if (layer_type == "text") {
    layout_options[["text-allow-overlap"]] <- merged_options$text_allow_overlap
    layout_options[["icon-image"]] <- ""
    layout_options[["text-font"]] <- list(merged_options$text_font)
    layout_options[["text-size"]] <- merged_options$text_size
    layout_options[["text-field"]] <- merged_options$text_field
  }
  non_default_options <- setdiff(
    names(merged_options),
    c(names(default_options))
  )

  if (length(non_default_options) > 0) {
    return(c(layout_options, merged_options[non_default_options]))
  }
  layout_options
}

#' Get paint options for a specific layer type
#'
#' This function returns a list of paint options based on the layer type and any
#' additional options provided.
#'
#' @note You can provide any paint options found in the
#' [MapLibre Layers docs](https://maplibre.org/maplibre-style-spec/layers/) in the `options`
#' argument, and they will be included in the returned list.
#' The default options are just a starting point and can be overridden by providing them in the
#' `options` argument.
#'
#' @param layer_type A string indicating the type of layer (e.g., "fill", "circle", "line").
#' @param options A list of additional options to customize the paint properties.
#'    See MapLibre docs for full options.
#'    \itemize{
#'      \item colour: The color to use for the layer. Default is "grey". `color` is also accepted as
#'        an alias for `colour`.
#'      \item opacity: The opacity to use for the layer. Default is 1 (fully opaque).
#'      \item line_width: The width of lines in line layers or the outline width for circle layers.
#'        Default is 1.
#'      \item line_dash: The dash pattern for line layers. Default is no dash (solid line).
#'        You can provide a vector of numbers to specify the dash pattern (e.g., c(2, 4) for a
#'        pattern of 2 units on, 4 units off).
#'      \item outline_colour: The color to use for the outline of circle or fill layers.
#'        Default is the same as `colour`. `outline_color` is also accepted as an alias for
#'        `outline_colour`.
#'      \item outline_opacity: The opacity to use for the outline of circle or fill layers.
#'        Default is the same as `opacity`.
#'      You can also provide any other paint options found in the MapLibre docs for the specific
#'      layer type, and they will be included in the returned list.
#' }
#' @return A list of paint options suitable for the specified layer type.
#' @export
#' @seealso [get_column()] for getting options from column values directly, [get_column_group()] for
#'   getting options by spiliting column values into groups, and [get_column_steps()] for
#'   getting options by spiliting column values into groups based on steps.
#'
#' @examples
#' \dontrun{
#' get_paint_options("line", list(colour = "blue", opacity = 0.8, line_width = 2))
#'
#' get_paint_options("circle", list(colour = "red", circle_radius = 10, outline_colour = "black"))
#'
#' # Use with get_column for data-driven styling:
#' get_paint_options("fill", list(colour = get_column("color"), opacity = get_column("opacity")))
#'
#' get_paint_options("fill", list(
#'    colour = get_column_group("group", c("A" = "green", "B" = "blue"))
#' ))
#'
#' get_paint_options("fill", list(
#'    opacity = get_column_steps("percent", c(25, 75), c("red", "orange", "yellow"))
#' ))
#'
#' # Provide options outside of the defaults
#' get_paint_options("circle", list("circle-blur" = 0.5))
#' }
get_paint_options <- function(layer_type, options = list()) {
  default_options <- list(
    colour = "grey",
    opacity = 1,
    line_width = 1,
    radius = 5,
    line_dash = list(1, 0) # No dash by default
  )
  merged_options <- utils::modifyList(default_options, options)
  paint_options <- structure(list(), names = character(0))
  if (layer_type %in% c("fill", "circle", "line")) {
    paint_options[[paste0(layer_type, "-color")]] <- merged_options$color %||%
      merged_options$colour
    paint_options[[paste0(layer_type, "-opacity")]] <- merged_options$opacity
  }
  if (layer_type == "circle") {
    paint_options[["circle-radius"]] <- merged_options$circle_radius %||%
      merged_options$radius
    paint_options[["circle-stroke-color"]] <- merged_options$outline_color %||%
      merged_options$outline_colour %||%
      merged_options$color %||%
      merged_options$colour
    paint_options[[
      "circle-stroke-opacity"
    ]] <- merged_options$outline_opacity %||%
      merged_options$opacity
    paint_options[["circle-stroke-width"]] <- merged_options$line_width
  }
  if (layer_type == "line") {
    paint_options[["line-width"]] <- merged_options$line_width
    paint_options[["line-dasharray"]] <- merged_options$line_dash
  }
  if (layer_type == "fill") {
    paint_options[["fill-outline-color"]] <- merged_options$outline_color %||%
      merged_options$outline_colour %||%
      merged_options$color %||%
      merged_options$colour
  }
  if (layer_type == "symbol") {
    paint_options[["icon-opacity"]] <- merged_options$opacity
    paint_options[["text-color"]] <- merged_options$color %||%
      merged_options$colour
  }
  if (layer_type == "text") {
    paint_options[["text-color"]] <- merged_options$color %||%
      merged_options$colour
  }
  non_default_options <- setdiff(
    names(merged_options),
    c(
      names(default_options),
      "color",
      "colour",
      "outline_color",
      "outline_colour",
      "outline_opacity",
      "circle_radius"
    )
  )
  if (length(non_default_options) > 0) {
    return(c(paint_options, merged_options[non_default_options]))
  }
  paint_options
}

#' Get a filter for a layer
#'
#' Parse a filter string into a list of filters that the map can use.
#'
#' @param filter_str A string or vector of strings representing the filter conditions.
#' @return A list where the first element is "all" if multiple filters are provided,
#'    or a single filter condition.
#' @export
#'
#' @examples
#' # Filter to only show rows where the "layer_id" column is equal to "forests"
#' get_layer_filter("layer_id == forests")
#'
#' # Filter to show rows where the "layer_id" column is equal to "sites" and the "project_status"
#' # column is equal to "Confirmed"
#' get_layer_filter(c("layer_id == sites", "project_status == Confirmed"))
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
  filters[[1]]
}
