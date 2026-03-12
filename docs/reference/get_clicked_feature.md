# Get the sf data frame of a clicked feature from the map widget.

The click input is a list containing the `layerId`, `properties`,
`geometry`, and `time`. Turn this into an `sf` object.

## Usage

``` r
get_clicked_feature(clicked_feature_input)
```

## Arguments

- clicked_feature_input:

  A list representing the drawn shape.

## Value

                     A `sf` object representing the clicked feature, or `NULL`.

## Note

`time` is not used in this function, but it is included in the input so
that the same feature can be clicked multiple times and the changed time
means that the input will be updated.
