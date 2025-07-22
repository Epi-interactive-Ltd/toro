#' Get the values for a paint or layout option in a map layer based on a column value.
#'
#' Allows the data to be styled by the group option in the column.
#'
#' @note If using numbers as the group values, then you need to use `setNames` rather
#' than a named vector, as the names of the vector will be coerced to strings.
#'
#' @param column_name         String representing the name of the column to be used.
#' @param named_group_values  Vector of value strings named by the group values.
#'                            The names of the vector should match the group values in the column.
#' @param default_value       String for the default value to use if no match is found.
#'                            Default is "#cccccc".
#' @returns                   List containing the paint or layout option to be set.
#' @examples
#' getColumnGroupValues("group", c("A" = "red", "B" = "blue"), "grey")
#' getColumnGroupValues("opacity", setNames(c(0.3, 0.5), c("A", "B")), 0.6)
#'
#' @export
getColumnGroupValues <- function(column_name, named_group_values, default_value = "#cccccc") {
  options <- vector("list", length(named_group_values) * 2)
  for (i in seq_along(named_group_values)) {
    options[[2 * i - 1]] <- names(named_group_values)[i]
    options[[2 * i]] <- named_group_values[[i]]
  }
  return(
    append(
      list("match", list("get", column_name)),
      c(options, default_value)
    )
  )
}
