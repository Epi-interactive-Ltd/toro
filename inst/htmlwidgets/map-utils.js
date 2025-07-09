/**
 * General map utilities for MapLibre maps.
 *
 * - copyLayerStyle: Copies the style from one layer to another in a MapLibre map.
 * - addImageToMapSource: Adds an image (for pin icons) to the map source.
 * - getPointFeaturesBounds: Gets the bounds of point features in a MapLibre map.
 * - addFeatureServerSource: Adds a FeatureServer layer to the map instance.
 * - disable3DView: Disables the 3D view (pitch rotation) on a MapLibre map.
 * - closeAttribution: Closes the attribution control on a MapLibre map once it has loaded.
 * - addMapLoader: Adds a loading overlay to the map element until the map loads initially.
 * - removeMapLoader: Removes the loading overlay from the map element.
 */

/**
 * Copy the style from one layer to another in a MapLibre map.
 *
 * @param {object} map Maplibre map instance.
 * @param {string} fromLayerId ID of the layer to copy style from.
 * @param {string} toLayerId ID of the layer to copy style to.
 * @returns {void}
 */
function copyLayerStyle(map, fromLayerId, toLayerId) {
  const fromLayer = map.getLayer(fromLayerId);
  if (!fromLayer) return;

  // Copy paint properties
  const paintProps =
    map.getStyle().layers.find((l) => l.id === fromLayerId).paint || {};
  Object.keys(paintProps).forEach((prop) => {
    const value = map.getPaintProperty(fromLayerId, prop);
    map.setPaintProperty(toLayerId, prop, value);
  });

  // Copy layout properties
  const layoutProps =
    map.getStyle().layers.find((l) => l.id === fromLayerId).layout || {};
  Object.keys(layoutProps).forEach((prop) => {
    const value = map.getLayoutProperty(fromLayerId, prop);
    map.setLayoutProperty(toLayerId, prop, value);
  });
}

/**
 * Add an image (for pin icons) to the map source.
 *
 * @param {object} map      A MapLibre map instance.
 * @param {string} imageId  ID of the image to add.
 * @param {string} imageUrl The local path to the image to add to the map.
 * @returns {void}
 */
async function addImageToMapSource(map, imageId, imageUrl) {
  const response = await map.loadImage(imageUrl);
  // Add the loaded image to the style's sprite with the ID 'photo'.
  map.addImage(imageId, response.data);
}

/**
 * Get the bounds of point features in a MapLibre map.
 *
 * @param {object[]} features MapLibre features array.
 * @returns {int[]} Bounds of the point features.
 */
function getPointFeaturesBounds(features) {
  if (!features.length) return null;
  // Initialize bounds with the first point
  let bounds = new maplibregl.LngLatBounds(
    features[0].geometry.coordinates,
    features[0].geometry.coordinates
  );
  for (let i = 1; i < features.length; i++) {
    bounds.extend(features[i].geometry.coordinates);
  }
  return bounds;
}

/**
 * Add a FeatureServer layer to the map instance.
 *
 * @note `url` should end with `/FeatureServer`,
 *        i.e., `"https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Latitude_and_Longitude_Grids/FeatureServer"`.
 *
 * @param {object} el       Widget element containing the map instance.
 * @param {string} url      URL of the ArcGIS FeatureServer layer to add.
 * @param {string} sourceId ID of the source to add.
 * @returns {void}
 */
function addFeatureServerSource(el, url, sourceId) {
  url = url + "/0/query?where=1=1&outFields=*&f=geojson";
  el.mapInstance.addSource(sourceId, {
    type: "geojson",
    data: url,
  });
}

/**
 * Disable the 3D view (pitch rotation) on a MapLibre map.
 *
 * @param {object} map Maplibre map instance.
 * @returns {void}
 */
function disable3DView(map) {
  // Disable pitch rotation (3D view)
  map.dragRotate.disable();
  map.keyboard.disable();
  map.touchZoomRotate.disable();
}

/**
 * Close the attribution control on a MapLibre map once it has loaded.
 *
 * @param {string} mapId ID of the map element.
 * @returns {void}
 */
function closeAttribution(mapId) {
  let map = document.getElementById(mapId);
  const attributionControl = map.querySelector(
    ".maplibregl-ctrl-attrib-button"
  );
  if (attributionControl) {
    attributionControl.click();
  }
}

/**
 * Add a loading overlay to the map element until the map loads initially.
 *
 * @param {object} el Widget element containing the map instance.
 * @returns {void}
 */
function addMapLoader(el) {
  // Add a loading overlay div
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "maplibre-loading-overlay";
  loadingDiv.innerHTML = '<div class="loader"></div>';
  el.appendChild(loadingDiv);
}

/**
 * Add a loading overlay to the map element until the map loads initially.
 *
 * @param {object} el Widget element containing the map instance.
 * @returns {void}
 */
function removeMapLoader(el) {
  // Add a loading overlay div
  const loadingDiv = el.querySelector(".maplibre-loading-overlay");
  if (!loadingDiv) return;
  loadingDiv.remove();
}

