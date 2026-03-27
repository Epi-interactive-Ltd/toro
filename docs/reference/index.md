# Package index

## Map Creation

Function to create maps

- [`map()`](https://epi-interactive-ltd.github.io/toro/reference/map.md)
  : Create a Maplibre map widget.

## Data Sources

Functions to interact with map data sources

- [`add_source()`](https://epi-interactive-ltd.github.io/toro/reference/add_source.md)
  : Utilities for the map related to map sources. Add a source to the
  map.
- [`set_source_data()`](https://epi-interactive-ltd.github.io/toro/reference/set_source_data.md)
  : Set data for a source on the map.
- [`add_feature_server_source()`](https://epi-interactive-ltd.github.io/toro/reference/add_feature_server_source.md)
  : Add a FeatureService source to the map.
- [`add_image()`](https://epi-interactive-ltd.github.io/toro/reference/add_image.md)
  : Add an image source to the map.

## Adding Layers

Functions to add map layers

- [`add_layer()`](https://epi-interactive-ltd.github.io/toro/reference/add_layer.md)
  : Utilities for the map related to layers. Add a layer to a map or map
  proxy.
- [`add_fill_layer()`](https://epi-interactive-ltd.github.io/toro/reference/add_fill_layer.md)
  : Add a fill layer to a map or map proxy.
- [`add_circle_layer()`](https://epi-interactive-ltd.github.io/toro/reference/add_circle_layer.md)
  : Add a circle layer to a map or map proxy.
- [`add_line_layer()`](https://epi-interactive-ltd.github.io/toro/reference/add_line_layer.md)
  : Add a line layer to a map or map proxy.
- [`add_symbol_layer()`](https://epi-interactive-ltd.github.io/toro/reference/add_symbol_layer.md)
  : Add a symbol layer to a map or map proxy. This layer is typically
  used for icons or pins.
- [`add_text_layer()`](https://epi-interactive-ltd.github.io/toro/reference/add_text_layer.md)
  : Add a text layer to a map or map proxy. This layer is typically used
  for text labels.
- [`add_lat_lng_grid()`](https://epi-interactive-ltd.github.io/toro/reference/add_lat_lng_grid.md)
  : Add a grid of latitude and longitude lines to the map.

## Updating Layers

Functions to update map layers

- [`show_layer()`](https://epi-interactive-ltd.github.io/toro/reference/show_layer.md)
  : Show a previously hidden layer on the map.
- [`hide_layer()`](https://epi-interactive-ltd.github.io/toro/reference/hide_layer.md)
  : Hide a layer from the map.
- [`toggle_clustering()`](https://epi-interactive-ltd.github.io/toro/reference/toggle_clustering.md)
  : Toggle clustering for a layer on the map.
- [`toggle_lat_lng_grid()`](https://epi-interactive-ltd.github.io/toro/reference/toggle_lat_lng_grid.md)
  : Show/hide the latitude and longitude grid on the map.

## Layer Styling

Functions to update map layer styling

- [`set_paint_property()`](https://epi-interactive-ltd.github.io/toro/reference/set_paint_property.md)
  : Set a paint property for a layer on the map.
- [`set_layout_property()`](https://epi-interactive-ltd.github.io/toro/reference/set_layout_property.md)
  : Set a layout property for a layer on the map.

## Styling Helpers

Functions to help with map/layer styling

- [`get_layout_options()`](https://epi-interactive-ltd.github.io/toro/reference/get_layout_options.md)
  : Get layout options for a specific layer type
- [`get_paint_options()`](https://epi-interactive-ltd.github.io/toro/reference/get_paint_options.md)
  : Get paint options for a specific layer type
- [`get_layer_filter()`](https://epi-interactive-ltd.github.io/toro/reference/get_layer_filter.md)
  : Get a filter for a layer
- [`get_column()`](https://epi-interactive-ltd.github.io/toro/reference/get_column.md)
  : Get a column from a dataset to use as a paint or layout option in a
  map layer.
- [`get_column_boolean()`](https://epi-interactive-ltd.github.io/toro/reference/get_column_boolean.md)
  : Get the value for a paint or layout option in a map layer based on a
  column boolean value.
- [`get_column_group()`](https://epi-interactive-ltd.github.io/toro/reference/get_column_group.md)
  : Get the values for a paint or layout option in a map layer based on
  a column value.
- [`get_column_step_steps()`](https://epi-interactive-ltd.github.io/toro/reference/get_column_step_steps.md)
  : Get the properties for a column in a map layer based on step breaks.

## Map Tiles

Functions to update map tiles

- [`set_tile_layer()`](https://epi-interactive-ltd.github.io/toro/reference/set_tile_layer.md)
  : Set the tile layer for the map.
- [`get_tile_options()`](https://epi-interactive-ltd.github.io/toro/reference/get_tile_options.md)
  : Get available tile layer options.

## Map view

Functions to manipulate the map view

- [`set_zoom()`](https://epi-interactive-ltd.github.io/toro/reference/set_zoom.md)
  : Utilites for the map related to the view. Set the map zoom level.
- [`set_bounds()`](https://epi-interactive-ltd.github.io/toro/reference/set_bounds.md)
  : Set the map bounds.

## Map Interaction

Functions to get information from map interaction

- [`get_clicked_feature()`](https://epi-interactive-ltd.github.io/toro/reference/get_clicked_feature.md)
  : Get the sf data frame of a clicked feature from the map widget.
- [`get_drawn_shape()`](https://epi-interactive-ltd.github.io/toro/reference/get_drawn_shape.md)
  : Get the drawn shape from the map widget.

## Controls - Basic

Simple map controls

- [`toggle_control()`](https://epi-interactive-ltd.github.io/toro/reference/toggle_control.md)
  : Utilities for the map related to controls. Toggle the visibility of
  a control on the map.
- [`remove_control()`](https://epi-interactive-ltd.github.io/toro/reference/remove_control.md)
  : Remove a control from the map.

## Controls - Drawing Tools

Controls for draw/edit workflows

- [`add_draw_control()`](https://epi-interactive-ltd.github.io/toro/reference/add_draw_control.md)
  : Functions related to the draw control. Add a draw control to the map
- [`remove_draw_control()`](https://epi-interactive-ltd.github.io/toro/reference/remove_draw_control.md)
  : Remove the draw control from the map.
- [`delete_drawn_shape()`](https://epi-interactive-ltd.github.io/toro/reference/delete_drawn_shape.md)
  : Delete a drawn shape from the map.

## Controls - View Tools

Controls for map view manipulation

- [`add_zoom_control()`](https://epi-interactive-ltd.github.io/toro/reference/add_zoom_control.md)
  : Functions related to zoom controls. Add a zoom control to the map.
- [`remove_zoom_control()`](https://epi-interactive-ltd.github.io/toro/reference/remove_zoom_control.md)
  : Remove the zoom control from the map.

## Controls - Layer Tools

Controls for updating map layers

- [`add_tile_selector_control()`](https://epi-interactive-ltd.github.io/toro/reference/add_tile_selector_control.md)
  : Functions relating to layer controls on the map. Add a tile selector
  control to the map or control panel
- [`remove_tile_selector_control()`](https://epi-interactive-ltd.github.io/toro/reference/remove_tile_selector_control.md)
  : Remove the tile selector control from the map.
- [`add_layer_selector_control()`](https://epi-interactive-ltd.github.io/toro/reference/add_layer_selector_control.md)
  : Add a layer selector control to the map or control panel
- [`remove_layer_selector_control()`](https://epi-interactive-ltd.github.io/toro/reference/remove_layer_selector_control.md)
  : Remove the layer selector control from the map.
- [`add_cluster_toggle()`](https://epi-interactive-ltd.github.io/toro/reference/add_cluster_toggle.md)
  : Add a cluster toggle control to the map or control panel
- [`remove_cluster_toggle()`](https://epi-interactive-ltd.github.io/toro/reference/remove_cluster_toggle.md)
  : Remove a cluster toggle control from the map
- [`add_visibility_toggle()`](https://epi-interactive-ltd.github.io/toro/reference/add_visibility_toggle.md)
  : Add a visibility toggle control to the map or control panel
- [`remove_visibility_toggle()`](https://epi-interactive-ltd.github.io/toro/reference/remove_visibility_toggle.md)
  : Remove a visibility toggle control from the map

## Controls - Animation Tools

Controls for performing map animations

- [`add_route()`](https://epi-interactive-ltd.github.io/toro/reference/add_route.md)
  : Add a route to a toro map.
- [`play_route()`](https://epi-interactive-ltd.github.io/toro/reference/play_route.md)
  : Play a route animation on a toro map.
- [`pause_route()`](https://epi-interactive-ltd.github.io/toro/reference/pause_route.md)
  : Pause a route animation on a toro map.
- [`remove_route()`](https://epi-interactive-ltd.github.io/toro/reference/remove_route.md)
  : Remove an animation route from a toro map.
- [`add_timeline_control()`](https://epi-interactive-ltd.github.io/toro/reference/add_timeline_control.md)
  : Functions related to animation controls. Add a timeline control to
  the map or control panel
- [`remove_timeline_control()`](https://epi-interactive-ltd.github.io/toro/reference/remove_timeline_control.md)
  : Remove the timeline control from the map.
- [`add_speed_control()`](https://epi-interactive-ltd.github.io/toro/reference/add_speed_control.md)
  : Add a speed control to the map or control panel
- [`remove_speed_control()`](https://epi-interactive-ltd.github.io/toro/reference/remove_speed_control.md)
  : Remove the speed control from the map.

## Controls — Misc

Additional interactive controls

- [`add_cursor_coords_control()`](https://epi-interactive-ltd.github.io/toro/reference/add_cursor_coords_control.md)
  : Add a cursor coordinates control to the map.
- [`remove_cursor_coords_control()`](https://epi-interactive-ltd.github.io/toro/reference/remove_cursor_coords_control.md)
  : Remove the cursor coordinates control from the map.
- [`add_custom_control()`](https://epi-interactive-ltd.github.io/toro/reference/add_custom_control.md)
  : Add a custom HTML control to the map.
- [`remove_custom_control()`](https://epi-interactive-ltd.github.io/toro/reference/remove_custom_control.md)
  : Remove a custom control from the map.
- [`add_cluster_toggle()`](https://epi-interactive-ltd.github.io/toro/reference/add_cluster_toggle.md)
  : Add a cluster toggle control to the map or control panel

## Control Panels

Functions to add/edit control panels for map interaction

- [`add_control_panel()`](https://epi-interactive-ltd.github.io/toro/reference/add_control_panel.md)
  : Functions to manage control panel elements in a map. Add a control
  panel to the map
- [`add_control_group()`](https://epi-interactive-ltd.github.io/toro/reference/add_control_group.md)
  : Add a control group to a control panel
- [`remove_control_group()`](https://epi-interactive-ltd.github.io/toro/reference/remove_control_group.md)
  : Remove a control group from a control panel
- [`remove_control_from_panel()`](https://epi-interactive-ltd.github.io/toro/reference/remove_control_from_panel.md)
  : Remove a control from a control panel.

## Shiny Integration

Functions to get information from map interaction

- [`mapOutput()`](https://epi-interactive-ltd.github.io/toro/reference/map-shiny.md)
  [`renderMap()`](https://epi-interactive-ltd.github.io/toro/reference/map-shiny.md)
  : Shiny bindings for map
- [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md)
  : Create a proxy object for updating the map.

## Extra features

Additional functions

- [`export_map_image()`](https://epi-interactive-ltd.github.io/toro/reference/export_map_image.md)
  : Utilities for the map related to exports. Export map as an image
  (non-Shiny context).
- [`save_map_html()`](https://epi-interactive-ltd.github.io/toro/reference/save_map_html.md)
  : Save map as standalone HTML file.
