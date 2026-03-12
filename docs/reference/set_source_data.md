# Set data for a source on the map.

Set data for a source on the map.

## Usage

``` r
set_source_data(proxy, source_id, data, type = "geojson")
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- source_id:

  The ID of the source to update.

- data:

  The data for the source, typically in GeoJSON format.

- type:

  The type of the source. Default is `"geojson"`. Other options include
  `"vector"` or `"raster"`.

## Value

         The map proxy object for chaining.
