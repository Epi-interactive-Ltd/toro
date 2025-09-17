/**
 * General map utilities for MapLibre maps.
 *
 * - addImagesToMap: Adds any images (for pin icons) to the map source.
 * - getPointFeaturesBounds: Gets the bounds of point features in a MapLibre map.
 * - addFeatureServerSource: Adds a FeatureServer layer to the map instance.
 * - disable3DView: Disables the 3D view (pitch rotation) on a MapLibre map.
 * - closeAttribution: Closes the attribution control on a MapLibre map once it has loaded.
 * - addMapLoader: Adds a loading overlay to the map element until the map loads initially.
 * - removeMapLoader: Removes the loading overlay from the map element.
 * - hexToRgbValues: Converts a hex colour string to RGB values.
 * - rgbToRgbValues: Converts a rgb colour string to RGB values.
 * - nameToRgbValues: Converts a css colour name string to RGB values.
 * - toRgbValues: Converts a css colour string to RGB values.
 */

/**
 * Add any images (for pin icons) to the map source.
 *
 * @param {object} map           A MapLibre map instance.
 * @param {object[]} imageSources Array of image source objects with `id` and `url` properties.
 * @return {void}
 */
function addImagesToMap(map, imageSources) {
  if (imageSources) {
    // Add any image sources to the map
    imageSources.forEach(function (imageSource) {
      _addImageToMapSource(map, imageSource.id, imageSource.url);
    });
  }
}

/**
 * Add an image (for pin icons) to the map source.
 *
 * @param {object} map      A MapLibre map instance.
 * @param {string} imageId  ID of the image to add.
 * @param {string} imageUrl The local path to the image to add to the map.
 * @returns {void}
 */
async function _addImageToMapSource(map, imageId, imageUrl) {
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
 * Close the attribution control on a MapLibre map once it has loaded.
 *
 * @param {string} mapId ID of the map element.
 * @returns {void}
 */
function closeAttribution(mapId) {
  let map = document.getElementById(mapId);
  const attributionControl = map.querySelector(".toro-ctrl-attrib-button");
  if (attributionControl) {
    attributionControl.click();
  }
}

/**
 * Add a loading overlay to the map element until the map loads initially.
 *
 * @param {object} el                     Widget element containing the map instance.
 * @param {boolean} [changeLoader=false]  Whether to use the initial or busy loader style.
 * @param {string} [bgColour="white"]     Background colour of the loading overlay.
 * @param {string} [loaderColour="black"] Colour of the loader.
 * @returns {void}
 */
function addMapLoader(
  el,
  changeLoader = false,
  bgColour = "white",
  loaderColour = "black"
) {
  // Add a loading overlay div
  const loadingDiv = document.createElement("div");
  loadingDiv.className =
    "maplibre-loading-overlay" +
    (changeLoader ? " busy-loader" : " initial-loader");
  loadingDiv.style.setProperty("--loader-bg-colour", bgColour);
  loadingDiv.innerHTML =
    '<div class="loader" style="--loader-colour:' + loaderColour + ';"></div>';
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

/**
 * Convert a hex colour string to RGB values.
 *
 * @param {string} hex  Hex colour string (e.g., "#000000").
 * @returns {string}    RGB values as a string (e.g., "0,0,0").
 */
function hexToRgbValues(hex) {
  let c = hex.replace("#", "");
  if (c.length === 3)
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r},${g},${b}`;
}

/**
 * Convert a rgb colour string to RGB values.
 *
 * @param {string} rgb  RGB colour string (e.g., "rgb(0,0,0)").
 * @returns {string}    RGB values as a string (e.g., "0,0,0").
 */
function rgbToRgbValues(rgb) {
  return rgb.replace(/^rgb\((.*)\)$/i, "$1");
}

/**
 * Convert a css colour name string to RGB values.
 *
 * @param {string} name   Colour string name (e.g., "black").
 * @returns {string}      RGB values as a string (e.g., "0,0,0").
 */
function nameToRgbValues(name) {
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = name;
  const hex = ctx.fillStyle;
  return hexToRgbValues(hex);
}

/**
 * Convert a css colour string to RGB values.
 * Can handle hex, rgb, rgba, and named colours.
 *
 * @param {string} colour  Colour string (e.g., "#000000", "rgb(0,0,0)", "black").
 * @returns {string}       RGB values as a string (e.g., "0,0,0").
 */
function toRgbValues(colour) {
  if (colour.startsWith("#")) {
    return hexToRgbValues(colour);
  } else if (colour.startsWith("rgb(")) {
    return rgbToRgbValues(colour);
  } else if (colour.startsWith("rgba(")) {
    // Optionally replace the alpha value
    return colour.replace(
      /rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)/,
      `$1,$2,$3`
    );
  } else {
    return nameToRgbValues(colour);
  }
}
