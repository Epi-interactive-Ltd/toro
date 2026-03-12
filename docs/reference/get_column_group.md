# Get the values for a paint or layout option in a map layer based on a column value.

Allows the data to be styled by the group option in the column.

## Usage

``` r
get_column_group(column_name, named_group_values, default_value = "#cccccc")
```

## Arguments

- column_name:

  String representing the name of the column to be used.

- named_group_values:

  Vector of value strings named by the group values. The names of the
  vector should match the group values in the column.

- default_value:

  String for the default value to use if no match is found. Default is
  "#cccccc".

## Value

List containing the paint or layout option to be set.

## Note

If using numbers as the group values, then you need to use `setNames`
rather than a named vector, as the names of the vector will be coerced
to strings.

## Examples

``` r
get_column_group("group", c("A" = "red", "B" = "blue"), "grey")
#> [[1]]
#> [1] "match"
#> 
#> [[2]]
#> [[2]][[1]]
#> [1] "get"
#> 
#> [[2]][[2]]
#> [1] "group"
#> 
#> 
#> [[3]]
#> [1] "A"
#> 
#> [[4]]
#> [1] "red"
#> 
#> [[5]]
#> [1] "B"
#> 
#> [[6]]
#> [1] "blue"
#> 
#> [[7]]
#> [1] "grey"
#> 
get_column_group("opacity", setNames(c(0.3, 0.5), c("A", "B")), 0.6)
#> [[1]]
#> [1] "match"
#> 
#> [[2]]
#> [[2]][[1]]
#> [1] "get"
#> 
#> [[2]][[2]]
#> [1] "opacity"
#> 
#> 
#> [[3]]
#> [1] "A"
#> 
#> [[4]]
#> [1] 0.3
#> 
#> [[5]]
#> [1] "B"
#> 
#> [[6]]
#> [1] 0.5
#> 
#> [[7]]
#> [1] 0.6
#> 
```
