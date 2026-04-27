# Add a GeoJSON/sf source

## Preparing the data

A GeoJSON source is a format used to represent geographical features (as
well as their non-geographic attributes). These sources can hold
features like polygons, lines, points, circles, and more. In R a GeoJSON
object will contain the `geojson` class.

An `sf` object is a [simple
feature](https://r-spatial.github.io/sf/articles/sf1.html) data frame
that contains a `geometry` column along with other columns containing a
variety of attributes. In R an `sf` object will contain the `sf` class.

For this example, we use the
[quakes](https://www.rdocumentation.org/packages/datasets/versions/3.6.2/topics/quakes)
dataset that comes with base R. `quakes` is, by default, just a data
frame. We use the `sf` package to turn it into a simple feature data
frame.

``` r

library(sf)
#> Linking to GEOS 3.13.0, GDAL 3.8.5, PROJ 9.5.1; sf_use_s2() is TRUE
library(geojsonsf)
library(dplyr)
#> 
#> Attaching package: 'dplyr'
#> The following objects are masked from 'package:stats':
#> 
#>     filter, lag
#> The following objects are masked from 'package:base':
#> 
#>     intersect, setdiff, setequal, union
library(toro)

data(quakes)
quakes_data <- quakes |>
  dplyr::mutate(hover = paste0("Magnitude: ", mag, "</br>Depth: ", depth)) |>
  sf::st_as_sf(coords = c("long", "lat"), crs = 4326)
```

At this point the data is still not GeoJSON data (it is an `sf` object),
however, the
[`add_source()`](https://epi-interactive-ltd.github.io/toro/reference/add_source.md)
function contains the ability to turn an `sf` object into a `geojson`
object. This means that we can pass `quakes_data` to
[`add_source()`](https://epi-interactive-ltd.github.io/toro/reference/add_source.md)
and it will be internally converted from `sf` to `geojson`.

For the purpose of this example, we will split `quakes_data` into two
objects:

1.  An `sf` object containing quakes with a magnitude below 6
2.  A `geojson` object containing quakes with a magnitude of 6 or above

``` r

# Keep as a sf object
sf_quakes_data <- quakes_data |>
  dplyr::filter(mag < 6)
print(sf_quakes_data)
#> Simple feature collection with 995 features and 4 fields
#> Geometry type: POINT
#> Dimension:     XY
#> Bounding box:  xmin: 165.67 ymin: -38.59 xmax: 188.13 ymax: -10.72
#> Geodetic CRS:  WGS 84
#> First 10 features:
#>    depth mag stations                         hover              geometry
#> 1    562 4.8       41 Magnitude: 4.8</br>Depth: 562 POINT (181.62 -20.42)
#> 2    650 4.2       15 Magnitude: 4.2</br>Depth: 650 POINT (181.03 -20.62)
#> 3     42 5.4       43  Magnitude: 5.4</br>Depth: 42     POINT (184.1 -26)
#> 4    626 4.1       19 Magnitude: 4.1</br>Depth: 626 POINT (181.66 -17.97)
#> 5    649 4.0       11   Magnitude: 4</br>Depth: 649 POINT (181.96 -20.42)
#> 6    195 4.0       12   Magnitude: 4</br>Depth: 195 POINT (184.31 -19.68)
#> 7     82 4.8       43  Magnitude: 4.8</br>Depth: 82   POINT (166.1 -11.7)
#> 8    194 4.4       15 Magnitude: 4.4</br>Depth: 194 POINT (181.93 -28.11)
#> 9    211 4.7       35 Magnitude: 4.7</br>Depth: 211 POINT (181.74 -28.74)
#> 10   622 4.3       19 Magnitude: 4.3</br>Depth: 622 POINT (179.59 -17.47)

# Transform into a geojson object
geojson_quakes_data <- quakes_data |>
  dplyr::filter(mag >= 6) |>
  geojsonsf::sf_geojson()
print(geojson_quakes_data)
#> {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"depth":139,"mag":6.1,"stations":94,"hover":"Magnitude: 6.1</br>Depth: 139"},"geometry":{"type":"Point","coordinates":[169.92,-20.7]}},{"type":"Feature","properties":{"depth":50,"mag":6.0,"stations":83,"hover":"Magnitude: 6</br>Depth: 50"},"geometry":{"type":"Point","coordinates":[165.96,-13.64]}},{"type":"Feature","properties":{"depth":127,"mag":6.4,"stations":122,"hover":"Magnitude: 6.4</br>Depth: 127"},"geometry":{"type":"Point","coordinates":[167.62,-15.56]}},{"type":"Feature","properties":{"depth":242,"mag":6.0,"stations":132,"hover":"Magnitude: 6</br>Depth: 242"},"geometry":{"type":"Point","coordinates":[167.02,-12.23]}},{"type":"Feature","properties":{"depth":165,"mag":6.0,"stations":119,"hover":"Magnitude: 6</br>Depth: 165"},"geometry":{"type":"Point","coordinates":[170.56,-21.59]}}]}
#> $...
#> NULL
```

## Adding a GeoJSON/sf source

There are two ways to add a GeoJSON/sf source to your map:

### The add_source() function

Using the
[`add_source()`](https://epi-interactive-ltd.github.io/toro/reference/add_source.md)
function, you can add a GeoJSON source by passing an `sf` or `geojson`
object directly to the `data` argument. `sf` objects will be
automatically converted to GeoJSON format when added as a source. You
can then use this source when adding layers to your map by specifying
the `source` argument in the layer functions.

You can pass either a `map`or `mapProxy` object to
[`add_source()`](https://epi-interactive-ltd.github.io/toro/reference/add_source.md).

``` r

map() |>
  set_bounds(bounds = quakes_data) |>
  add_source("sf_quakes_data", data = sf_quakes_data) |>
  add_source("geojson_quakes_data", data = geojson_quakes_data) |>
  add_circle_layer(
    id = "quakes_circles_sf",
    source = "sf_quakes_data",
    hover_column = "hover",
    paint = get_paint_options("circle", list(colour = "orange"))
  ) |>
    add_circle_layer(
    id = "quakes_circles_geojson",
    source = "geojson_quakes_data",
    hover_column = "hover",
    paint = get_paint_options("circle", list(colour = "red"))
  )
```

### Adding the source directly in the layer function

Alternatively, you can add a GeoJSON/sf source directly within a layer
function by passing a sf object or GeoJSON string to the `source`
argument. In this case the source ID will be automatically generated by
appending the layer ID to `source-`. For example, if you add a layer
with `id = "my_layer"` and `source` is a sf object, the source will be
added to the map with the ID `"source-my_layer"`. This allows you to add
the source and layer in a single step, without needing to call
[`add_source()`](https://epi-interactive-ltd.github.io/toro/reference/add_source.md)
separately.

``` r

map() |>
  set_bounds(bounds = quakes_data) |>
  add_circle_layer(
    id = "quakes_circles_sf",
    source = sf_quakes_data,
    hover_column = "hover",
    paint = get_paint_options("circle", list(colour = "orange"))
  ) |>
    add_circle_layer(
    id = "quakes_circles_geojson",
    source = geojson_quakes_data,
    hover_column = "hover",
    paint = get_paint_options("circle", list(colour = "red"))
  )
```
