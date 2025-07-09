#' Get the colours for a paint or layout option in a map layer based on a column value.
#'
#' Allows the data to be styled by the group option in the column.
#'
#' @param column_name         String representing the name of the column to be used.
#' @param named_group_colours Vector of colour strings named by the group values.
#'                            The names of the vector should match the group values in the column.
#' @param default_colour      String for the default colour to use if no match is found.
#'                            Default is "#cccccc".
#' @returns                   List containing the paint or layout option to be set.
#' @examples
#' getColumnGroupColours("group", c("A" = "red", "B" = "blue"), "grey")
#'
#' @export
getColumnGroupColours <- function(column_name, named_group_colours, default_colour = "#cccccc") {
  options <- unlist(
    lapply(seq_along(named_group_colours), function(i) {
      c(names(named_group_colours)[i], named_group_colours[i])
    }),
    use.names = FALSE
  )

  return(
    append(
      list("match", list("get", column_name)),
      c(options, default_colour)
    )
  )
}
