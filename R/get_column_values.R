#' Get a column from a dataset to use as a paint or layout option in a map layer
#'
#' Allows the column value to be used for styling features in a map layer.
#'
#' @param column_name String representing the name of the column to be used.
#' @return List containing the paint or layout option to be set.
#' @export
#'
#' @examples
#' get_column("opacity")
#' get_column("icon")
#' # Use in a paint property: list("circle-color" = get_column("color"))
get_column <- function(column_name) {
  list("get", column_name)
}

#' Get the value for a paint or layout option in a map layer based on a column boolean value
#'
#' Allows the data to be styled by the group option in the column.
#'
#' @param column_name String representing the name of the column to be used.
#' @param true_value Value to use when the column value is `TRUE`.
#' @param false_value Value to use when the column value is `FALSE`.
#' @return List containing the paint or layout option to be set.
#' @export
#'
#' @examples
#' get_column_boolean("group", "red", "grey")
get_column_boolean <- function(column_name, true_value, false_value) {
  append(
    list("case", list("boolean", list("get", column_name), FALSE)),
    c(true_value, false_value)
  )
}

#' Get the values for a paint or layout option in a map layer based on a column value
#'
#' Allows the data to be styled by the group option in the column.
#'
#' @note If using numbers as the group values, then you need to use `stats::setNames` rather
#' than a named vector, as the names of the vector will be coerced to strings.
#'
#' @param column_name String representing the name of the column to be used.
#' @param named_group_values Vector of value strings named by the group values.
#'   The names of the vector should match the group values in the column.
#' @param default_value String for the default value to use if no match is found.
#'    Default is "#cccccc".
#' @return List containing the paint or layout option to be set.
#' @export
#'
#' @examples
#' get_column_group("group", c("A" = "red", "B" = "blue"), "grey")
#' get_column_group("opacity", stats::setNames(c(0.3, 0.5), c("A", "B")), 0.6)
get_column_group <- function(
  column_name,
  named_group_values,
  default_value = "#cccccc"
) {
  options <- vector("list", length(named_group_values) * 2)
  for (i in seq_along(named_group_values)) {
    options[[2 * i - 1]] <- names(named_group_values)[i]
    options[[2 * i]] <- named_group_values[[i]]
  }
  append(
    list("match", list("get", column_name)),
    c(options, default_value)
  )
}

#' Get the properties for a column in a map layer based on step breaks
#'
#' Allows the data to be styled by the step breaks in the column.
#'
#' @param column_name String representing the name of the column to be used.
#' @param breaks Numeric vector of thresholds (must be sorted ascending).
#' @param values Vector of values, length = length(breaks) + 1.
#' @return List containing the paint or layout option to be set.
#' @export
#'
#' @examples
#' get_column_steps("value", c(10, 20, 30), c("red", "orange", "yellow", "green"))
get_column_steps <- function(column_name, breaks, values) {
  stopifnot(length(values) == length(breaks) + 1)
  expr <- list("step", list("get", column_name), values[[1]])
  for (i in seq_along(breaks)) {
    expr <- append(expr, list(breaks[[i]], values[[i + 1]]))
  }
  expr
}
