# Get the properties for a column in a map layer based on step breaks

Allows the data to be styled by the step breaks in the column.

## Usage

``` r
get_column_step_steps(column_name, breaks, values)
```

## Arguments

- column_name:

  String representing the name of the column to be used

- breaks:

  Numeric vector of thresholds (must be sorted ascending)

- values:

  Vector of values, length = length(breaks) + 1

## Value

List containing the paint or layout option to be set

## Examples

``` r
get_column_step_steps("value", c(10, 20, 30), c("red", "orange", "yellow", "green"))
#> [[1]]
#> [1] "step"
#> 
#> [[2]]
#> [[2]][[1]]
#> [1] "get"
#> 
#> [[2]][[2]]
#> [1] "value"
#> 
#> 
#> [[3]]
#> [1] "red"
#> 
#> [[4]]
#> [1] 10
#> 
#> [[5]]
#> [1] "orange"
#> 
#> [[6]]
#> [1] 20
#> 
#> [[7]]
#> [1] "yellow"
#> 
#> [[8]]
#> [1] 30
#> 
#> [[9]]
#> [1] "green"
#> 
```
