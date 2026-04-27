# Get the value for a paint or layout option in a map layer based on a column boolean value

Allows the data to be styled by the group option in the column.

## Usage

``` r
get_column_boolean(column_name, true_value, false_value)
```

## Arguments

- column_name:

  String representing the name of the column to be used

- true_value:

  Value to use when the column value is `TRUE`

- false_value:

  Value to use when the column value is `FALSE`

## Value

List containing the paint or layout option to be set

## Examples

``` r
get_column_boolean("group", "red", "grey")
#> [[1]]
#> [1] "case"
#> 
#> [[2]]
#> [[2]][[1]]
#> [1] "boolean"
#> 
#> [[2]][[2]]
#> [[2]][[2]][[1]]
#> [1] "get"
#> 
#> [[2]][[2]][[2]]
#> [1] "group"
#> 
#> 
#> [[2]][[3]]
#> [1] FALSE
#> 
#> 
#> [[3]]
#> [1] "red"
#> 
#> [[4]]
#> [1] "grey"
#> 
```
