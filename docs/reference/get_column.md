# Get a column from a dataset to use as a paint or layout option in a map layer.

Allows the column value to be used for styling features in a map layer.

## Usage

``` r
get_column(column_name)
```

## Arguments

- column_name:

  String representing the name of the column to be used.

## Value

List containing the paint or layout option to be set.

## Examples

``` r
get_column("opacity")
#> [[1]]
#> [1] "get"
#> 
#> [[2]]
#> [1] "opacity"
#> 
get_column("icon")
#> [[1]]
#> [1] "get"
#> 
#> [[2]]
#> [1] "icon"
#> 
# Use in a paint property: list("circle-color" = get_column("color"))
```
