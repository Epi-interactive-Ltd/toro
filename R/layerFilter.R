#' Get a filter for a layer
#'
#' Parse a filter string into a list of filters that the map can use.
#'
#' @param filter_str  A string or vector of strings representing the filter conditions.
#' @returns           A list where the first element is "all" if multiple filters are provided,
#'                    or a single filter condition.
#' @examples
#' layerFilter("layer_id == forests")
#' layerFilter(c("layer_id == sites", "project_status == Confirmed"))
#'
#' @export
layerFilter <- function(filter_str) {
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
