# Get the drawn shape from the map widget.

Parses the JSON string returned by the map widget when a shape is drawn.
Ensures that the ID of the shape is included in the resulting `sf`
object.

## Usage

``` r
get_drawn_shape(create_input_string)
```

## Arguments

- create_input_string:

  A JSON string representing the drawn shape.

## Value

                   A `sf` object representing the drawn shape, or `NULL`.
