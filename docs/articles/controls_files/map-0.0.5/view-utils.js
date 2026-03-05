/**
 * Utilities for handling map view operations.
 *
 * Functions:
 * - disable3DView: Disables the 3D view (pitch rotation) on a MapLibre map.
 * - updateShinyView: Updates Shiny inputs with the current map bounds and zoom level.
 * - setMapBounds: Sets the bounds of a MapLibre map.
 */

/**
 * Disable the 3D view (pitch rotation) on a MapLibre map.
 *
 * @param {object} map Maplibre map instance.
 * @returns {void}
 */
function disable3DView(map) {
  map.dragRotate.disable();
  map.keyboard.disable();
  map.touchZoomRotate.disable();
}

/**
 * Update Shiny inputs with the current map bounds and zoom level.
 * So that the values can be used in Shiny apps.
 *
 * @param {HTMLElement} el   The HTML element containing the map.
 * @param {object} map       Maplibre map instance.
 * @return {void}
 */
function updateShinyView(el, map) {
  var bounds = map.getBounds();
  var zoom = map.getZoom();

  Shiny.setInputValue(el.id + "_bounds", {
    xmin: bounds.getWest(),
    ymin: bounds.getSouth(),
    xmax: bounds.getEast(),
    ymax: bounds.getNorth(),
  });
  Shiny.setInputValue(el.id + "_zoom", zoom);
}

/**
 * Set the bounds of a MapLibre map.
 *
 * @param {object} map          Maplibre map instance.
 * @param {object} bounds       Bounds to set on the map, typically a LngLatBounds object.
 * @param {number} [maxZoom]    Maximum zoom level to apply when fitting bounds.
 * @param {number} [padding=50] Padding around the bounds in pixels.
 * @return {void}
 */
function setMapBounds(map, bounds, maxZoom, padding = 50) {
  if (!bounds) {
    console.warn("No bounds provided for setMapBounds.");
    return;
  }
  if (!maxZoom) {
    maxZoom = map.getMaxZoom();
  }
  map.fitBounds(bounds, {
    padding: padding,
    maxZoom: maxZoom,
  });
}
