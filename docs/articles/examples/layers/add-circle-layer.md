# Add a circle layer

## Adding circle layers

First, set up the base map with our data.

``` r

library(toro)
library(sf)
#> Linking to GEOS 3.13.0, GDAL 3.8.5, PROJ 9.5.1; sf_use_s2() is TRUE
library(dplyr)
#> 
#> Attaching package: 'dplyr'
#> The following objects are masked from 'package:stats':
#> 
#>     filter, lag
#> The following objects are masked from 'package:base':
#> 
#>     intersect, setdiff, setequal, union
library(spData)
#> To access larger datasets in this package, install the spDataLarge
#> package with: `install.packages('spDataLarge',
#> repos='https://nowosad.github.io/drat/', type='source')`

elevation_data <- spData::nz_height |>
  sf::st_transform(4326) |>
  dplyr::mutate(
    info = paste("Elevation:", format(elevation, big.mark = ","))
  )
```

### Basic example

``` r

map() |>
  set_bounds(elevation_data, padding = 100) |>
  add_circle_layer(
    id = "elevation",
    source = elevation_data,
    hover_column = "info"
  )
```

### Advanced example

``` r

map() |>
  set_bounds(elevation_data, padding = 100) |>
  add_circle_layer(
    id = "elevation",
    source = elevation_data,
    hover_column = "info",
    paint = get_paint_options(
      "circle",
      options = list(
        colour = get_column_step_steps(
          "elevation",
          c(3000, 3500),
          c("#093d4a", "#11a366", "#dbe811")
        ),
        circle_radius = get_column_step_steps(
          "elevation",
          c(3000, 3500),
          c(2, 3, 4)
        )
      )
    ),
    layout = get_layout_options(
      "circle",
      options = list(
        "circle-sort-key" = get_column_step_steps(
          "elevation",
          c(3000, 3500),
          c(1, 2, 3)
        )
      )
    )
  )
```
