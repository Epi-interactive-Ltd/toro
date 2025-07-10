# MaplibReGL Features

## Map loaded event

Layers and sources can only be added to the map after it has been loaded. You can use the `map_loaded` event to wait for the map to be ready before adding layers or sources.

```r
map <- maplibReGL::map(elementId = "map")

observe({
  req(input$map_loaded)
  map$add_layer(
    layer_options = list(...),
    on_feature_click = TRUE
  )
}) %>%
  bindEvent(input$map_loaded)
```

## Feature click events

If you want a click on a feature (polygon, line, point) to return the feature as an `sf` object, you can set `on_feature_click = TRUE` in the `add_layer` function and then have an observer that listens for the `input$<map-id>_feature_click` input.
This input will be a list containing the `layerId`, `properties`, `geometry`, and `time` of the clicked feature. You can then use the `getClickedFeature` function to convert this list into an `sf` object.

```r
map <- maplibReGL::map(elementId = "map")

observe({
  req(input$map_loaded)
  map$add_layer(
    layer_options = list(...),
    on_feature_click = TRUE
  )
}) %>%
  bindEvent(input$map_loaded)

observe({
  req(input$map_feature_click)
  clicked_feature <- maplibReGL::getClickedFeature(input$map_feature_click)
  # Do something with the clicked feature sf
}) %>%
  bindEvent(input$map_feature_click)
```
