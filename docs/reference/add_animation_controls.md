# Add animation controls to a toro map

Adds play/pause/stop buttons to control route animations on the map.
Optionally includes a speed control slider for adjusting animation
speed.

## Usage

``` r
add_animation_controls(
  map,
  route_id = NULL,
  position = "top-right",
  panel_id = NULL,
  buttons = c("play", "pause"),
  include_speed_control = FALSE,
  speed_values = c(0.5, 1, 2),
  speed_labels = c("Slow", "Normal", "Fast"),
  settings = list()
)
```

## Arguments

- map:

  A toro map object or a map proxy object.

- route_id:

  Optional route ID to control. If NULL, controls all routes.

- position:

  Position of the controls on the map. Default is "top-right".

- panel_id:

  Optional control panel ID to add controls to instead of map.

- buttons:

  Character vector of buttons to include. Options: "play", "pause",
  "stop". Default is c("play", "pause").

- include_speed_control:

  Logical. Whether to include a speed control slider. Default is FALSE.

- speed_values:

  Numeric vector of speed values for the speed slider. Default is c(0.5,
  1, 2) for slow, normal, and fast speeds.

- speed_labels:

  Character vector of labels for speed values. Default is c("Slow",
  "Normal", "Fast").

- settings:

  A list of additional settings for the controls.

## Value

The map or map proxy object for chaining.

## Examples

``` r
library(sf)
#> Linking to GEOS 3.13.0, GDAL 3.8.5, PROJ 9.5.1; sf_use_s2() is TRUE

line_data <- sf::st_sf(
  id = 1,
  geometry = sf::st_sfc(
    sf::st_linestring(
      cbind(c(172.2041, 163.9383), c(-32.56960, -46.43999))
    ),
    crs = 4326
  )
)

map() |>
  add_route(route_id = "route_line", points = line_data) |>
  add_animation_controls(route_id = "route_line", include_speed_control = TRUE)

{"x":{"style":"lightgrey","center":[174,-41],"zoom":2,"options":{"minZoom":2,"maxZoom":18,"clusterColour":"#808080","loadedTiles":["lightgrey","satellite"],"initialTileLayer":null,"backgroundColour":"#D0CFD4","enable3D":false,"initialLoadedLayers":null,"spinnerWhileBusy":false,"busyLoaderBgColour":"rgba(0, 0, 0, 0.2)","busyLoaderColour":"white","initialLoaderBgColour":"white","initialLoaderColour":"black"},"imageSources":null,"routes":[{"routeId":"route_line","points":{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"id":1.0},"geometry":{"type":"LineString","coordinates":[[172.2041,-32.5696],[163.9383,-46.43999]]}}]},"options":[]}],"animationControls":[{"type":"animation","routeId":"route_line","position":"top-right","panelId":null,"buttons":["play","pause"],"includeSpeedControl":true,"speedValues":[0.5,1,2],"speedLabels":["Slow","Normal","Fast"],"settings":[]}],"controls":[{"type":"animation","routeId":"route_line","position":"top-right","panelId":null,"buttons":["play","pause"],"includeSpeedControl":true,"speedValues":[0.5,1,2],"speedLabels":["Slow","Normal","Fast"],"settings":[]}]},"evals":[],"jsHooks":[]}
```
