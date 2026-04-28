# Integration with Shiny

> Shiny is a framework for R and Python. [Learn
> more](https://shiny.posit.co/)

``` r

library(shiny)
library(toro)

ui <- fluidPage(
  toro::mapOutput("map")
)

server <- function(input, output, session) {
  output$map <- toro::renderMap({
    toro::map()
  })
}

if (interactive()) {
  shinyApp(ui, server)
}
```

## Understanding mapProxy

To modify a map on a shiny page without re-rendering the whole widget
you can use `mapProxy`.

Typically you use `map` to create the initial static map widget, and
then use `mapProxy` to update more dynamic aspects of the map.

``` r

library(shiny)
library(toro)


ui <- fluidPage(
  toro::mapOutput("map"),
  selectInput(
    "tiles",
    "Tiles",
    choices = toro::get_tile_options(),
    selected = "satellite"
  ),
)

server <- function(input, output, session) {
  output$map <- toro::renderMap({
    toro::map(style = "satellite", loadedTiles = toro::get_tile_options())
  })

  observe({
    req(input$tiles)
    toro::mapProxy("map") |>
      set_tile_layer(input$tiles)
  })
}

if (interactive()) {
  shinyApp(ui, server)
}
```

## Modifying the map using IDs

In Shiny to modify parts of a map you need to provide the ID of the
aspect you want to update.

### Map IDs

The ID of the map in the shiny context. This is the ID you use to render
the map and also to modify it using `mapProxy`. The map ID is also used
in the events and status in the below sections.

- [`renderMap()`](https://epi-interactive-ltd.github.io/toro/reference/map-shiny.md)

- [`mapOutput()`](https://epi-interactive-ltd.github.io/toro/reference/map-shiny.md)

- [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md)

### Layer IDs

When you add a layer to the map you can provide an ID for that layer.
This ID can then be used to modify the layer later on.

Add functions:

- [`add_layer()`](https://epi-interactive-ltd.github.io/toro/reference/add_layer.md)

- [`add_fill_layer()`](https://epi-interactive-ltd.github.io/toro/reference/add_fill_layer.md)

- [`add_circle_layer()`](https://epi-interactive-ltd.github.io/toro/reference/add_circle_layer.md)

- [`add_line_layer()`](https://epi-interactive-ltd.github.io/toro/reference/add_line_layer.md)

- [`add_symbol_layer()`](https://epi-interactive-ltd.github.io/toro/reference/add_symbol_layer.md)

- [`add_text_layer()`](https://epi-interactive-ltd.github.io/toro/reference/add_text_layer.md)

- [`add_lat_lng_grid()`](https://epi-interactive-ltd.github.io/toro/reference/add_lat_lng_grid.md)

Visibility functions:

- [`show_layer()`](https://epi-interactive-ltd.github.io/toro/reference/show_layer.md)

- [`hide_layer()`](https://epi-interactive-ltd.github.io/toro/reference/hide_layer.md)

- [`toggle_lat_lng_grid()`](https://epi-interactive-ltd.github.io/toro/reference/toggle_lat_lng_grid.md)

- [`toggle_clustering()`](https://epi-interactive-ltd.github.io/toro/reference/toggle_clustering.md)

Controls that target layers:

- [`add_cluster_toggle()`](https://epi-interactive-ltd.github.io/toro/reference/add_cluster_toggle.md)

- [`add_visibility_toggle()`](https://epi-interactive-ltd.github.io/toro/reference/add_visibility_toggle.md)

- [`remove_cluster_toggle()`](https://epi-interactive-ltd.github.io/toro/reference/remove_cluster_toggle.md)

- [`remove_visibility_toggle()`](https://epi-interactive-ltd.github.io/toro/reference/remove_visibility_toggle.md)

Layer customisation:

- [`set_paint_property()`](https://epi-interactive-ltd.github.io/toro/reference/set_paint_property.md)

- [`set_layout_property()`](https://epi-interactive-ltd.github.io/toro/reference/set_layout_property.md)

### Source IDs

When you add a source to the map you can provide an ID for that source.
This ID can then be used to modify the source later on. If you add a
source inside of an add layer function then the source ID will be auto
generated for you.

Add functions:

- [`add_source()`](https://epi-interactive-ltd.github.io/toro/reference/add_source.md)

- [`add_feature_server_source()`](https://epi-interactive-ltd.github.io/toro/reference/add_feature_server_source.md)

- [`add_image()`](https://epi-interactive-ltd.github.io/toro/reference/add_image.md)

Modifying functions:

- [`set_source_data()`](https://epi-interactive-ltd.github.io/toro/reference/set_source_data.md)

### Control IDs

When you add a control to the map you can provide an ID for that
control. This ID can then be used to modify the control later on.

Some controls are linked to other element IDs (like the cluster and
visibility toggles needing layer IDs).

Add functions:

- [`add_custom_control()`](https://epi-interactive-ltd.github.io/toro/reference/add_custom_control.md)

- [`add_cursor_coords_control()`](https://epi-interactive-ltd.github.io/toro/reference/add_cursor_coords_control.md)

- [`add_control_panel()`](https://epi-interactive-ltd.github.io/toro/reference/add_control_panel.md)

- [`add_control_group()`](https://epi-interactive-ltd.github.io/toro/reference/add_control_group.md)

- [`add_draw_control()`](https://epi-interactive-ltd.github.io/toro/reference/add_draw_control.md)

Remove functions:

- [`remove_control()`](https://epi-interactive-ltd.github.io/toro/reference/remove_control.md)

- [`remove_custom_control()`](https://epi-interactive-ltd.github.io/toro/reference/remove_custom_control.md)

- [`remove_cursor_coords_control()`](https://epi-interactive-ltd.github.io/toro/reference/remove_cursor_coords_control.md)

- [`remove_control_group()`](https://epi-interactive-ltd.github.io/toro/reference/remove_control_group.md)

- [`remove_draw_control()`](https://epi-interactive-ltd.github.io/toro/reference/remove_draw_control.md)

### Animation IDs

When you add a route to the map you can provide an ID for that route.
This ID can then be used to modify the route later on.

Add functions:

- [`add_route()`](https://epi-interactive-ltd.github.io/toro/reference/add_route.md)

Remove functions:

- [`remove_route()`](https://epi-interactive-ltd.github.io/toro/reference/remove_route.md)

Other functions:

- [`play_route()`](https://epi-interactive-ltd.github.io/toro/reference/play_route.md)

- [`pause_route()`](https://epi-interactive-ltd.github.io/toro/reference/pause_route.md)

### Other IDs

When using a draw control to draw shapes. Each shape will have an ID
that can be used to delete the shape with
[`delete_drawn_shape()`](https://epi-interactive-ltd.github.io/toro/reference/delete_drawn_shape.md).

------------------------------------------------------------------------

## Inputs & events

### Map loaded event

By default when the map initially loads it will trigger a *loaded* event
in Shiny.

You can use this event to trigger other actions in your Shiny app.

The Shiny input value is available as `input$<mapId>_loaded`, where
`<mapId>` is the output ID of the map.

``` r

# In UI
mapOutput("my_map")

# In server loaded events watching <map_id>_loaded input values
observe({
  req(input$my_map_loaded)
  print("Map has loaded!")
}) |>
  bindEvent(input$my_map_loaded)
```

### Feature click events

Anytime a feature (polygon, line, point) is clicked on the map, a
*feature_click* event is fired.

You can listen for this event using an observer in your Shiny app. Just
append `_feature_click` to the map ID to get the input ID
(`input$<mapId>_feature_click`).

``` r

# In UI
mapOutput("my_map")

# In server feature click events watching <map_id>_feature_click input values
observe({
  print(get_clicked_feature(input$my_map_feature_click))
})
```

### Map view status

Whenever the map view changes (zoom/bounds) a *bounds* / *zoom* event is
fired. You can listen for this event using an observer in your Shiny
app. Just append `_bounds` / `_zoom` to the map ID to get the input ID
(`input$<mapId>_bounds` / `input$<mapId>_zoom`).

``` r

# In UI
mapOutput("my_map")

# In server bounds / zoom events watching <map_id>_bounds / <map_id>_zoom input values
observe({
  print(input$my_map_bounds)
})

observe({
  print(input$my_map_zoom)
})
```
