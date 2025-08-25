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

Anytime a feature (polygon, line, point) is clicked on the map, a `feature_click` event is fired. You can listen for this event using an observer in your Shiny app. Just append `_feature_click` to the map ID to get the input ID.

```r
observe({
  # If map ID is "map", the input ID will be "map_feature_click"
  print(get_clicked_feature(input$map_feature_click))
})
```

## Map view status

Whenever the map view changes (zoom/bounds) a `bounds` / `zoom` event is fired. You can listen for this event using an observer in your Shiny app. Just append `_bounds` / `_zoom` to the map ID to get the input ID.

```r
# Assuming the map ID is "map"
observe({
  print(input$map_bounds)
})

observe({
  print(input$map_zoom)
})
```
