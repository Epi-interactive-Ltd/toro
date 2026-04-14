# Add a symbol layer

## Adding symbol layers

First, set up the base map with our data.

``` r

library(toro)
library(sf)
#> Warning: package 'sf' was built under R version 4.5.2
#> Linking to GEOS 3.13.0, GDAL 3.8.5, PROJ 9.5.1; sf_use_s2() is TRUE

base_map <- map(
  imageSources = list(
    list(
      id = "map_pin",
      url = "https://upload.wikimedia.org/wikipedia/commons/f/f2/678111-map-marker-512.png"
    )
  )
) |>
  add_feature_server_source(
    "https://services8.arcgis.com/AYGZtmUtpARUKBlB/arcgis/rest/services/Te_Reo_M%C4%81ori_Place_Names/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
    "maori_places_data",
    append_query_url = ""
  )
```

### Basic example

``` r

base_map |>
  add_symbol_layer(
    id = "places_text",
    source = "maori_places_data",
    hover_column = "type",
    popup_column = "name",
    can_cluster = FALSE,
    filter = get_layer_filter("type == village"),
    layout = toro::get_layout_options(
      "symbol",
      options = list(
        icon_image = "map_pin",
        icon_size = 0.05
      )
    )
  )
```
