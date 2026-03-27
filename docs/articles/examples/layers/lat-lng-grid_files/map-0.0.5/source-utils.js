/**
 * Convert a longitude value to be within the range of -180 to 180 degrees.
 *
 * @param {number} longitude The longitude value to validate.
 * @returns {number} The validated longitude value within the range of -180 to 180 degrees.
 */
function _validateLongitude(longitude) {
  if (longitude < -180) {
    return longitude + 360;
  }
  if (longitude > 180) {
    return longitude - 360;
  }
  return longitude;
}

/**
 * Normalize GeoJSON coordinates to handle antimeridian crossings.
 * Converts negative longitudes to positive (-180 - 180 range) for better clustering.
 *
 * @param {object} geojson GeoJSON FeatureCollection or Feature
 * @returns {object} GeoJSON with normalized coordinates
 */
function normalizeAntimeridianCoordinates(geojson) {
  if (!geojson || !geojson.features) return geojson;

  const normalizedGeoJSON = JSON.parse(JSON.stringify(geojson)); // Deep clone

  normalizedGeoJSON.features = normalizedGeoJSON.features.map((feature) => {
    if (feature.geometry && feature.geometry.coordinates) {
      const coords = feature.geometry.coordinates;

      if (feature.geometry.type === 'Point') {
        // Normalize longitude for Point geometries
        coords[0] = _validateLongitude(coords[0]);
      } else if (feature.geometry.type === 'MultiPoint') {
        // Normalize longitude for MultiPoint geometries
        coords.forEach((point) => {
          point[0] = _validateLongitude(point[0]);
        });
      }
    }
    return feature;
  });
  return normalizedGeoJSON;
}

/**
 * Add data a source to the map instance.
 *
 * @note If the source is a GeoJSON source with clustering enabled, the coordinates will be
 * normalized to handle antimeridian crossings.
 *
 * @param {object} mapInstance A MapLibre map instance.
 * @param {string} sourceId    ID of the source to add.
 * @param {object} sourceOptions Options for the source (e.g., type, data, cluster).
 * @returns {void}
 */
function addDataSourceToMap(mapInstance, sourceId, sourceOptions) {
  // Apply antimeridian normalization to GeoJSON sources when clustering is enabled
  if (sourceOptions.type === 'geojson' && sourceOptions.cluster && sourceOptions.data) {
    sourceOptions.data = normalizeAntimeridianCoordinates(sourceOptions.data);
  }
  mapInstance.addSource(sourceId, sourceOptions);
}

/**
 * Update a data source on the map instance.
 *
 * @note If the source is a GeoJSON source with clustering enabled, the coordinates will be
 * normalized to handle antimeridian crossings.
 *
 * @param {object} mapInstance A MapLibre map instance.
 * @param {string} sourceId    ID of the source to update.
 * @param {object} data        Data to update the source with.
 * @returns {void}
 */
function updateSourceData(mapInstance, sourceId, data) {
  const source = mapInstance.getSource(sourceId);

  if (source) {
    // Apply antimeridian normalization if this is a clustered GeoJSON source
    const sourceOptions = source._options;
    if (sourceOptions && sourceOptions.cluster && data) {
      data = normalizeAntimeridianCoordinates(data);
    }

    source.setData(data);
  } else {
    console.warn('Source not found or not a GeoJSON source:', sourceId);
  }
}
