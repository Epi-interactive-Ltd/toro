# Add a text layer

## Adding text layers

First, set up the base map with our data.

``` r
library(toro)
library(sf)
#> Linking to GEOS 3.13.0, GDAL 3.8.5, PROJ 9.5.1; sf_use_s2() is TRUE

base_map <- map() |>
  add_feature_server_source(
    "https://services8.arcgis.com/AYGZtmUtpARUKBlB/arcgis/rest/services/Te_Reo_M%C4%81ori_Place_Names/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
    "maori_places_data",
    append_query_url = ""
  )
```

### Basic example

``` r
base_map |>
  add_text_layer(
    id = "places_text",
    source = "maori_places_data",
    hover_column = "name",
    layout = toro::get_layout_options(
      "text",
      options = list(
        text_field = toro::get_column("name_mi")
      )
    )
  )
```

### Advanced example

``` r
base_map |>
  add_text_layer(
    id = "places_texts",
    source = "maori_places_data",
    hover_column = "name",
    layout = get_layout_options(
      "text",
      options = list(
        text_field = toro::get_column("name_mi"),
        text_size = get_column_group("type", c("river" = 18), 12),
        "symbol-sort-key" = get_column_group(
          "type",
          c(
            "city" = 6,
            "town" = 5,
            "village" = 4,
            "suburb" = 3,
            "locality" = 2
          ),
          1
        )
      )
    ),
    paint = get_paint_options(
      "text",
      options = list(
        colour = get_column_group(
          "type",
          c(
            "city" = "#014f86",
            "town" = "#0177CB",
            "village" = "#0195FE",
            "suburb" = "#34AAFE",
            "locality" = "#67BFFE"
          ),
          "#9AD4FE"
        )
      )
    )
  )
```
