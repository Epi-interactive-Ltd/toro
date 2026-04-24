# Changelog

## toro 0.0.6 (2026-04-24)

### New Features

- Adding some image/html export options
  ([`export_map_image()`](https://epi-interactive-ltd.github.io/toro/reference/export_map_image.md)
  and
  [`save_map_html()`](https://epi-interactive-ltd.github.io/toro/reference/save_map_html.md))

### Bug Fixes and Improvements

- More documentation coverage/clean up
- Fixing general route animation bugs + adding documentation
- Fixing general draw control bugs + adding documentation
- Allow for pinch-to-zoom on mobile
- Split symbol and text layers into two separate functions
  ([`add_symbol_layer()`](https://epi-interactive-ltd.github.io/toro/reference/add_symbol_layer.md)
  and
  [`add_text_layer()`](https://epi-interactive-ltd.github.io/toro/reference/add_text_layer.md))
- Adding different class names to popups (`popup-ovelay`) and hovers
  (`hover-ovelay`) for customised styling

## toro 0.0.5 (2026-03-05)

### New Features

- Added cluster/spiderfy customisation (see the [Cluster/Spiderfying
  vignette](https://epi-interactive-ltd.github.io/toro/articles/map-clusters.html)
  for more details).
- `loadedTiles` now allows you to supply tile options for each tile set
  (see the [Map Tiles
  vignette](https://epi-interactive-ltd.github.io/toro/articles/map-tiles.html)
  for more details).
- Added route animations and timeline controls (see the [Animations
  vignette](https://epi-interactive-ltd.github.io/toro/articles/animations.html)
  for more details).

### Bug Fixes and Improvements

- Fixed clusters not showing up
- Better clustering around the antimeridian line
- Fixed some issues around adding sources in the add layer functions
- Updated
  [`add_feature_server_source()`](https://epi-interactive-ltd.github.io/toro/reference/add_feature_server_source.md)
  to allow the full url to be passed so the user can specify the query
  they want to make to the feature server
- Fixed the `under_id` parameter so layers can be added under a specific
  layer already on the map
- Fixed popups showing null/undefined
- Fixed clusters disappearing at max zoom
- Fixed pins with the same coordinates so they always appear in a
  cluster (and spiderfy)
- Fixed the attribution not closing by default
- Various documentation/vignette improvements and updates
- Changed the “light-grey” style to “lightgrey”

## toro 0.0.4 (2025-11-05)

- First version! 🎉
