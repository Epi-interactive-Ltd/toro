# Add a circle layer

## Adding circle layers

First, set up the base map with our data.

``` r

library(toro)
library(sf)
#> Linking to GEOS 3.13.0, GDAL 3.8.5, PROJ 9.5.1; sf_use_s2() is TRUE

base_map <- map() |>
  add_feature_server_source(
    "https://services8.arcgis.com/AYGZtmUtpARUKBlB/arcgis/rest/services/Te_Reo_M%C4%81ori_Place_Names/FeatureServer/2/query?where=1=1&outFields=*&f=geojson",
    "maori_maunga_data",
    append_query_url = FALSE
  )
```

### Basic example

``` r

base_map |>
  add_circle_layer(
    id = "maunga_circles",
    source = "maori_moana_data",
    hover_column = "name_mi",
    popup_column = "name"
  )
```

### Advanced example

``` r

base_map |>
  add_circle_layer(
    id = "maunga_peaks",
    source = "maori_maunga_data",
    hover_column = "name_mi",
    popup_column = "name",
    paint = get_paint_options(
      "circle",
      options = list(
        colour = get_column_group("type", c("volcano" = "#9d0208"), "#a3b18a"),
        opacity = get_column_group("type", c("volcano" = 1), 0.8),
        circle_radius = get_column_group("type", c("volcano" = 7), 4)
      )
    ),
    layout = get_layout_options(
      "circle",
      options = list(
        "circle-sort-key" = get_column_group("type", c("volcano" = 2), 1)
      )
    )
  )
```
