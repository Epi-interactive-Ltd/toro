# Add a FeatureServer source to the map.

Add a FeatureServer source to the map.

## Usage

``` r
add_feature_server_source(map, source_url, source_id, append_query_url = TRUE)
```

## Arguments

- map:

  The map or map proxy object.

- source_url:

  The URL of the FeatureServer source.

- source_id:

  The ID for the source.

- append_query_url:

  Whether to append the query parameters to the URL. Default is `TRUE`.

## Value

           The map or map proxy object for chaining.

## Examples

``` r
if (interactive()) {
 map() |>
   add_feature_server_source(
     "https://services1.arcgis.com/VwarAUbcaX64Jhub/arcgis/rest/services/World_Exclusive_Economic_Zones_Boundaries/FeatureServer",
     "eez"
   ) |>
   add_line_layer(id = "eez_lines", source = "eez")
}
```
