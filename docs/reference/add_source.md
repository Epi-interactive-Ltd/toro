# Utilities for the map related to map sources. Add a source to the map.

Utilities for the map related to map sources. Add a source to the map.

## Usage

``` r
add_source(map, source_id, data, type = "geojson", cluster = FALSE, ...)
```

## Arguments

- map:

  The map or map proxy object.

- source_id:

  The ID for the source.

- data:

  The data for the source, typically in GeoJSON format.

- type:

  The type of the source. Default is `"geojson"`. Other options include
  `"vector"` or `"raster"`.

- cluster:

  Whether to enable clustering for this source. Default is `FALSE`.

## Value

The map or map proxy object for chaining.

## Note

If you add a source directly in an add layer function, the source ID
will be automatically generated as "source-".

## Examples

``` r
if (FALSE) { # \dontrun{
 map() |>
   add_source(
     source_id = "my_source",
     data = sf::st_as_sf(quakes, coords = c("long", "lat"), crs = 4326)
   ) |>
   add_circle_layer(id = "quakes", source = "my_source")
} # }
```
