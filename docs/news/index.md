# Changelog

## toro 0.0.5 (2026-03-05)

### New Features

- Added cluster/spiderfy customisation (see the [Cluster/Spiderfying
  vignette](https://epi-interactive-ltd.github.io/toro/articles/map-clusters.html)
  for more details).
- `loadedTiles` now allows you to supply tile options for each tile set
  (see the [Map Tiles
  vignette](https://epi-interactive-ltd.github.io/toro/articles/map-tiles.html)
  for more details).
- Added route animations and timeline controls (see the [Route
  Animations
  vignette](https://epi-interactive-ltd.github.io/toro/articles/route-animations.html)
  for more details **Documentation to come**).

### Bug Fixes and improvements

- Fxied clusters not showing up
- Better clustering around the antimerdian line
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
