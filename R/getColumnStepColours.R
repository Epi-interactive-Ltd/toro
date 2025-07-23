#' Get the colours for a column in a map layer based on step breaks.
#'
#' Allows the data to be styled by the step breaks in the column.
#'
#' @param column_name     String representing the name of the column to be used.
#' @param breaks          Numeric vector of thresholds (must be sorted ascending).
#' @param colours         Vector of colours, length = length(breaks) + 1.
#' @returns               List containing the paint or layout option to be set.
#' @examples
#' getColumnStepColours("value", c(10, 20, 30), c("red", "orange", "yellow", "green", "blue"))
#'
#' @export
getColumnStepColours <- function(column_name, breaks, colours) {
  stopifnot(length(colours) == length(breaks) + 1)
  expr <- list("step", list("get", column_name), colours[[1]])
  for (i in seq_along(breaks)) {
    expr <- append(expr, list(breaks[[i]], colours[[i + 1]]))
  }
  expr
}
