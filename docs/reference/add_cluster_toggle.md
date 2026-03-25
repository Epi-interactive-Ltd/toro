# Add a cluster toggle control to the map or control panel

Creates a toggle button that can enable/disable clustering for a
specific layer.

## Usage

``` r
add_cluster_toggle(
  map,
  layer_id,
  control_id = NULL,
  left_label = "Toggle Clustering",
  right_label = NULL,
  initial_state = FALSE,
  position = "top-right",
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
)
```

## Arguments

- map:

  The map or map proxy object.

- layer_id:

  ID of the layer to toggle clustering for.

- control_id:

  ID for the control. If NULL, defaults to
  "cluster-toggle-\<layer_id\>".

- left_label:

  Label text for the toggle button. Default is "Toggle Clustering".

- right_label:

  Label text for the toggle button when clustering is off. Default is
  "Clustering Off".

- initial_state:

  Initial clustering state. Default is FALSE.

- position:

  Position on the map if not using a control panel. Default is
  "top-right".

- panel_id:

  ID of control panel to add to (optional).

- section_title:

  Section title when added to a control panel.

- group_id:

  ID of control group to add to (optional).

## Value

The map or map proxy object for chaining.

## Examples

``` r
if (FALSE) { # \dontrun{
library(shiny)
library(toro)
library(sf)

# Prepare data
data(quakes)
quakes_data <- quakes |>
 sf::st_as_sf(coords = c("long", "lat"), crs = 4326)

map() |>
 add_symbol_layer(
   id = "quakes",
   source = quakes_data,
   can_cluster = TRUE
 ) |>
 add_cluster_toggle(layer_id = "quakes")
} # }
```
