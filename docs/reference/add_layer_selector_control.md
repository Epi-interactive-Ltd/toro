# Add a layer selector control to the map or control panel

Creates a dropdown selector that allows switching between layers,
showing only the selected layer while hiding all others. This is useful
for comparing different data layers or allowing users to choose between
mutually exclusive visualizations.

## Usage

``` r
add_layer_selector_control(
  map,
  layer_ids,
  labels = NULL,
  default_layer = NULL,
  none_option = FALSE,
  none_label = "None",
  position = "top-right",
  panel_id = NULL,
  section_title = NULL,
  group_id = NULL
)
```

## Arguments

- map:

  The map or map proxy object.

- layer_ids:

  Vector of layer IDs to include in the selector.

- labels:

  Named vector of labels for layers. If NULL, uses layer IDs directly.

- default_layer:

  Default layer to select. If NULL, uses the first layer.

- none_option:

  Whether to include a "None" option that hides all layers. Default is
  FALSE.

- none_label:

  Label for the "None" option. Default is "None".

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
if (interactive()) {
  # Create a map with multiple layers
  map() %>%
    add_circle_layer("points", data1, id = "layer1") %>%
    add_fill_layer("polygons", data2, id = "layer2") %>%
    add_layer_selector_control(
      layer_ids = c("layer1", "layer2"),
      labels = c("layer1" = "Points", "layer2" = "Polygons"),
      default_layer = "layer1"
    )
}
```
