# Get a filter for a layer

Parse a filter string into a list of filters that the map can use.

## Usage

``` r
get_layer_filter(filter_str)
```

## Arguments

- filter_str:

  A string or vector of strings representing the filter conditions

## Value

A list where the first element is "all" if multiple filters are
provided, or a single filter condition

## Examples

``` r
if (FALSE) { # \dontrun{
# Filter to only show rows where the "layer_id" column is equal to "forests"
get_layer_filter("layer_id == forests")

# Filter to show rows where the "layer_id" column is equal to "sites" and the "project_status"
# column is equal to "Confirmed"
get_layer_filter(c("layer_id == sites", "project_status == Confirmed"))
} # }
```
