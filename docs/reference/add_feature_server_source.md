# Add a FeatureService source to the map.

Add a FeatureService source to the map.

## Usage

``` r
add_feature_server_source(
  map,
  source_url,
  source_id,
  append_query_url = "/0/query?where=1=1&outFields=*&f=geojson"
)
```

## Arguments

- map:

  The map or map proxy object.

- source_url:

  The URL of the FeatureService source.

- source_id:

  The ID for the source.

- append_query_url:

  The query URL to append to the source URL. Default is
  `"/0/query?where=1=1&outFields=*&f=geojson"`.

## Value

The map or map proxy object for chaining.

## Examples

``` r
if (FALSE) { # \dontrun{
 map() |>
   add_feature_server_source(
     "https://services1.arcgis.com/VwarAUbcaX64Jhub/arcgis/rest/services/World_Exclusive_Economic_Zones_Boundaries/FeatureServer",
     "eez"
   ) |>
   add_line_layer(id = "eez_lines", source = "eez")
} # }
```
