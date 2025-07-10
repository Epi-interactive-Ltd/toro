#' Get the value for a paint or layout option in a map layer based on a column boolean value.
#'
#' Allows the data to be styled by the group option in the column.
#'
#' @param column_name String representing the name of the column to be used.
#' @param true_value  Value to use when the column value is `TRUE`.
#' @param false_value Value to use when the column value is `FALSE`.
#' @returns           List containing the paint or layout option to be set.
#' @examples
#' getColumnBooleanValues("group", c("A" = "red", "B" = "blue"), "grey")
#'
#' @export
getColumnBooleanValues <- function(column_name, true_value, false_value) {
  return(
    append(
      list("case", list("boolean", list("get", column_name), FALSE)),
      c(true_value, false_value)
    )
  )
}
