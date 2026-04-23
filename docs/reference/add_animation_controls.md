# Add animation controls to a toro map.

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

                     The updated map object.
