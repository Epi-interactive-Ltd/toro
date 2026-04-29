# Add a FeatureService source to the map

Add a FeatureService source to the map

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

## Note

By default the function appends a query URL to the provided `source_url`
to retrieve all features in GeoJSON format. If you need more control
over the query parameters, you can provide the full query URL directly
in the `source_url` argument and set `append_query_url` to an empty
string to prevent appending the default query parameters.

## Examples

``` r
# \donttest{
service_url <- paste0(
 "https://services1.arcgis.com/VwarAUbcaX64Jhub/arcgis/rest/services/",
 "World_Exclusive_Economic_Zones_Boundaries/FeatureServer"
)

 map() |>
   add_feature_server_source(service_url, "eez") |>
   add_line_layer(id = "eez_lines", source = "eez")

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"sources":[{"sourceId":"eez","sourceOptions":{"type":"geojson","data":"https://services1.arcgis.com/VwarAUbcaX64Jhub/arcgis/rest/services/World_Exclusive_Economic_Zones_Boundaries/FeatureServer/0/query?where=1=1&outFields=*&f=geojson"}}],"layers":[{"id":"eez_lines","type":"line","source":{"type":"geojson","data":"eez"},"paint":{"line-color":"grey","line-opacity":1,"line-width":1,"line-dasharray":[1,0]},"layout":{"line-cap":"round","line-join":"round"},"popupColumn":null,"hoverColumn":null,"canCluster":false,"filter":null,"beforeId":null}]},"evals":[],"jsHooks":[]}# }
```
