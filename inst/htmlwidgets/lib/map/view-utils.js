/**
 * @file view-utils.js
 * @summary View utilities for MapLibre maps.
 *
 * @description
 * Utilities to assist with managing the map view in MapLibre GL JS.
 */

/**
 * Disable the 3D view (pitch rotation) on a MapLibre map.
 *
 * @param {object} map MapLibre map instance.
 * @returns {void}
 */
function disable3DView(map) {
  map.dragRotate.disable();
  map.keyboard.disable();
  map.touchZoomRotate.enable();
  map.touchZoomRotate.disableRotation(); // Only allow zooming, not rotation, on touch devices
  // Disables 2-finger swipe-up/down pitch gestures
  map.setPitch(0);
  map.on('pitchstart', () => map.setPitch(0));
  map.on('pitch', () => map.setPitch(0));
}

/**
 * Update Shiny inputs with the current map bounds and zoom level.
 * So that the values can be used in Shiny apps.
 *
 * @param {HTMLElement} el The HTML element containing the map.
 * @param {object} map MapLibre map instance.
 * @return {void}
 */
function updateShinyView(el, map) {
  var bounds = map.getBounds();
  var zoom = map.getZoom();

  Shiny.setInputValue(el.id + '_bounds', {
    xmin: bounds.getWest(),
    ymin: bounds.getSouth(),
    xmax: bounds.getEast(),
    ymax: bounds.getNorth(),
  });
  Shiny.setInputValue(el.id + '_zoom', zoom);
}

/**
 * Set the bounds of a MapLibre map.
 *
 * If no `options.maxZoom` is set, then get the max zoom from the map object.
 *
 * @param {object} map MapLibre map instance.
 * @param {object} bounds Bounds to set on the map, typically a LngLatBounds object.
 * @param {number} [padding=50] Padding around the bounds in pixels.
 * @param {object} [options={}] Extra options to pass to the
 *   [MapLibre GL JS `fitBounds` function](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/FitBoundsOptions/).
 * @return {void}
 */
function setMapBounds(map, bounds, padding = 50, options = {}) {
  if (!bounds) {
    console.warn('No bounds provided for setMapBounds.');
    return;
  }
  if (!options?.maxZoom) {
    options.maxZoom = map.getMaxZoom();
  }
  map.fitBounds(bounds, {
    padding: padding,
    ...options,
  });
}
