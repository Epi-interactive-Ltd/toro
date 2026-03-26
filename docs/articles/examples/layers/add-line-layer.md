# Add a line layer

## Adding line layers

First, set up the base map with our data.

``` r
library(toro)
library(sf)
#> Linking to GEOS 3.13.0, GDAL 3.8.5, PROJ 9.5.1; sf_use_s2() is TRUE

base_map <- map() |>
  add_feature_server_source(
    "https://services8.arcgis.com/AYGZtmUtpARUKBlB/arcgis/rest/services/Te_Reo_M%C4%81ori_Place_Names/FeatureServer/4/query?where=1=1&outFields=*&f=geojson",
    "maori_awa_data",
    append_query_url = ""
  )
```

### Basic example

``` r
base_map |>
  add_line_layer(
    id = "awa_lines",
    source = "maori_awa_data",
    hover_column = "name_mi",
    popup_column = "name"
  )
```

### Advanced example

``` r
base_map |>
  add_line_layer(
    id = "awa_lines",
    source = "maori_awa_data",
    hover_column = "name_mi",
    popup_column = "name",
    paint = get_paint_options(
      "line",
      options = list(
        colour = get_column_group(
          "type",
          c("river" = "#014f86", "stream" = "#61a5c2"),
          "#a9d6e5"
        ),
        line_width = get_column_group("type", c("river" = 3), 1)
      )
    )
  )
```
