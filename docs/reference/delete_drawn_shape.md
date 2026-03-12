# Delete a drawn shape from the map.

The ID of the shape is provided by the draw control when a shape is
created.

## Usage

``` r
delete_drawn_shape(proxy, shape_id)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- shape_id:

  The ID of the shape to delete.

## Value

         The map proxy object for chaining.
