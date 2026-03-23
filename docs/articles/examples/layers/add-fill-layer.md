# Add a fill layer

## Adding fill layers

First, set up the base map with our data.

``` r

library(toro)
library(sf)
#> Linking to GEOS 3.13.0, GDAL 3.8.5, PROJ 9.5.1; sf_use_s2() is TRUE

base_map <- map() |>
  add_feature_server_source(
    "https://services8.arcgis.com/AYGZtmUtpARUKBlB/arcgis/rest/services/Te_Reo_M%C4%81ori_Place_Names/FeatureServer/3/query?where=1=1&outFields=*&f=geojson",
    "maori_moana_data",
    append_query_url = ""
  ) |>
  add_feature_server_source(
    "https://services8.arcgis.com/AYGZtmUtpARUKBlB/arcgis/rest/services/Te_Reo_M%C4%81ori_Place_Names/FeatureServer/1/query?where=1=1&outFields=*&f=geojson",
    "maori_region_data",
    append_query_url = ""
  )
```

### Basic example

``` r

base_map |>
  add_fill_layer(
    id = "moana_polygons",
    source = "maori_moana_data",
    hover_column = "name_mi",
    popup_column = "name"
  )
```

### Advanced example

``` r

base_map |>
  add_fill_layer(
    id = "region_polygons",
    source = "maori_region_data",
    hover_column = "name_mi",
    popup_column = "name",
    paint = get_paint_options(
      "fill",
      options = list(
        colour = "#a3b18a",
        opacity = 0.3,
        outline_colour = "#588157"
      )
    )
  ) |>
  add_fill_layer(
    id = "moana_polygons",
    source = "maori_moana_data",
    hover_column = "name_mi",
    popup_column = "name",
    paint = get_paint_options(
      "fill",
      options = list(
        colour = get_column_group(
          "type",
          c(
            "lake" = "#a9d6e5",
            "reservoir" = "#89c2d9",
            "river" = "#61a5c2",
            "bay" = "#468faf",
            "sea" = "#2c7da0",
            "ocean" = "#2a6f97",
            "glacier" = "#014f86",
            "swamp" = "#01497c",
            "lagoon" = "#013a63"
          ),
          "#012a4a"
        )
      )
    )
  )
```
