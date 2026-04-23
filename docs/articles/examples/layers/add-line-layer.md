# Add a line layer

## Adding line layers

First, set up the base map with our data.

``` r

library(toro)
library(spData)
#> To access larger datasets in this package, install the spDataLarge
#> package with: `install.packages('spDataLarge',
#> repos='https://nowosad.github.io/drat/', type='source')`
library(sf)
#> Linking to GEOS 3.13.0, GDAL 3.8.5, PROJ 9.5.1; sf_use_s2() is TRUE

seine_data <- spData::seine |>
  sf::st_transform(4326)
```

### Basic example

``` r

map() |>
  set_bounds(seine_data, padding = 100) |>
  add_line_layer(
    id = "seine",
    source = seine_data,
    hover_column = "name"
  )
```

### Advanced example

``` r

map() |>
  set_bounds(seine_data, padding = 100) |>
  add_line_layer(
    id = "seine",
    source = seine_data,
    hover_column = "name",
    paint = get_paint_options(
      "line",
      options = list(
        colour = get_column_group(
          "name",
          c("Marne" = "#014f86", "Seine" = "#61a5c2"),
          "#a9d6e5"
        ),
        line_width = get_column_group("name", c("Seine" = 3), 1)
      )
    )
  )
```
