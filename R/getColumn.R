#' Get a column from a dataset to use as a paint or layout option in a map layer.
#'
#' Allows the column value to be used for styling features in a map layer.
#'
#' @param column_name String representing the name of the column to be used.
#' @returns           List containing the paint or layout option to be set.
#' @examples
#' getColumn("opacity")
#' getColumn("icon")
#' # Use in a paint property: list("circle-color" = getColumn("color"))
#'
#' @export
getColumn <- function(column_name) {
  return(list("get", column_name))
}
