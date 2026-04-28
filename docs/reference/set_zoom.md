# Set the map zoom level

Set the map zoom level

## Usage

``` r
set_zoom(map, zoom)
```

## Arguments

- map:

  The map or map proxy object

- zoom:

  The zoom level to set. Default is 2

## Value

The map or map proxy object for chaining

## Examples

``` r
if (FALSE) { # \dontrun{
 map() |>
  set_zoom(5)

 mapProxy("map") |>
   set_zoom(5)
} # }
```
