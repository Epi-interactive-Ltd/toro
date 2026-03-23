# Latitude and longitude grid layer

## Adding a latitude and longitude grid layer

### Basic example

``` r

library(toro)
map() |>
  add_lat_lng_grid("red")
```

### Advanced example

For more info on controls see the [Controls
Vignette](https://epi-interactive-ltd.github.io/toro/articles/controls.html)

``` r

library(toro)
map() |>
  add_lat_lng_grid("red") |>
  add_visibility_toggle("lat_lng_grid")
```
