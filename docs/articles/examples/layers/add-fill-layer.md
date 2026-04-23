# Add a fill layer

## Adding fill layers

First, set up the base map with our data.

``` r

library(toro)
library(spData)
#> To access larger datasets in this package, install the spDataLarge
#> package with: `install.packages('spDataLarge',
#> repos='https://nowosad.github.io/drat/', type='source')`
library(dplyr)
#> 
#> Attaching package: 'dplyr'
#> The following objects are masked from 'package:stats':
#> 
#>     filter, lag
#> The following objects are masked from 'package:base':
#> 
#>     intersect, setdiff, setequal, union
library(sf)
#> Linking to GEOS 3.13.0, GDAL 3.8.5, PROJ 9.5.1; sf_use_s2() is TRUE


region_data <- spData::nz |>
  dplyr::rename(geometry = geom) |>
  sf::st_transform(4326) |>
  dplyr::mutate(
    popup = paste("Population:", format(Population, big.mark = ","))
  )
```

### Basic example

``` r

map() |>
  set_bounds(region_data, padding = 100) |>
  add_fill_layer(
    id = "regions",
    source = region_data,
    hover_column = "Name",
    popup_column = "popup"
  )
```

### Advanced example

``` r

map() |>
  set_bounds(region_data, padding = 100) |>
  add_fill_layer(
    id = "regions",
    source = region_data,
    hover_column = "Name",
    popup_column = "popup",
    paint = get_paint_options(
      "fill",
      options = list(
        colour = get_column_step_steps(
          "Population",
          c(50000, 500000, 1000000),
          c("#093d4a", "#11a366", "#20de60", "#dbe811")
        ),
        opacity = 0.7
      )
    )
  )
```
