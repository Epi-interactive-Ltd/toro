/**
 * Clustering utilities for MapLibre maps.
 * 
 * - addClusterLayer: Adds a cluster layer to a MapLibre map with spiderfying functionality.
 * - addClusterSpiderfying: Initializes spiderfying functionality for clusters on a MapLibre map.
 * - addSpiderfyingLayers: Adds layers and sources for spiderfying clusters.
 * - getSpiderfiedFeatures: Updates cluster features to spiderfy them around a center point.
 * - getSpiderfyLines: Creates GeoJSON data for lines connecting the cluster center to spiderfied points.
 * - onClusterClick: Handles cluster click events to either spiderfy points or zoom in on the cluster.
 * - toggleLayerClustering: Turns clustering on or off for a specific layer in a MapLibre map.
 * - closeSpiderfy: Clears spiderfy layer data to close any open clusters.
 */


/**
 * Add layers needed for clustering a specific layer.
 * 
 * @param {object} el       HTML widget element containing the map instance.
 * @param {string} layerId  ID of the layer to add clusters to.
 * @param {string} sourceId ID of the source that contains the cluster data.
 * @returns {void}
 *
 * @see {@link addClusterSpiderfying}
 * @see {@link toggleLayerClustering}
 */
function addClusterLayer(el, layerId, sourceId) {
  el.mapInstance.addLayer({
    id: `${layerId}-clusters`,
    type: 'circle',
    source: sourceId,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': el.clusterColour,
      'circle-radius': 20,
      'circle-stroke-width': 4,
      'circle-stroke-color': el.clusterColour,
      'circle-stroke-opacity': 0.5
    }
  }, layerId);

  // 3. Add a symbol layer for cluster counts
  el.mapInstance.addLayer({
    id: `${layerId}-cluster-count`,
    type: 'symbol',
    source: sourceId,
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['Open Sans Regular'],
      'text-size': 12
    }
  }, layerId);
  el.ourLayers.push(`${layerId}-cluster-count`);
  el.ourLayers.push(`${layerId}-clusters`);

  addClusterSpiderfying(el, layerId, sourceId);
  toggleLayerClustering(el.mapInstance, layerId, true);
  addLayerCursor(el.mapInstance, [layerId, `${layerId}-clusters`, `${layerId}-cluster-count`]);
}

/**
 * Add spiderfying to clusters.
 * 
 * @param {object} el       HTML widget element containing the map instance.
 * @param {string} layerId  ID of the layer to add clusters to.
 * @param {string} sourceId ID of the source that contains the cluster data.
 * @returns {void}
 *
 * @see {@link closeSpiderfy}
 * @see {@link onClusterClick}
 */
function addClusterSpiderfying(el, layerId, sourceId) {
  // Close the spiderfy when clicking outside of the spiderfy layers.
  const spiderfyLayers = ["spiderfy-lines", "spiderfy-pins", `${layerId}-cluster-count`, `${layerId}-clusters`, layerId];
  el.mapInstance.on('click', async (e) => {
    const features = el.mapInstance.queryRenderedFeatures(e.point, { layers: spiderfyLayers });
    if (features.length === 0) {
      // Click was NOT on any of the spiderfyLayers - close any open spiderfy
      closeSpiderfy(el.mapInstance);
      el.openClusterId = null;
    }
  });
  el.mapInstance.on('click', `${layerId}-clusters`, (e) => {
    onClusterClick(e, el, layerId, sourceId);
  });

  // When a zoom is started, close any open spiderfy
  el.mapInstance.on('zoomstart', function () {
    if (el.openClusterId) {
      closeSpiderfy(el.mapInstance); // Close any open cluster when zooming starts
      el.openClusterId = null; // Reset the open cluster ID
    }
  });
}

/**
 * Add the layers (and sources) required for spiderfying clusters on a MapLibre map.
 * 
 * @param {object} map Maplibre map instance.
 * @returns {void}
 *
 * @see {@link addLayerPopup}
 */
function addSpiderfyingLayers(map) {
  map.addSource("spiderfy-lines-source", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
    cluster: false
  });
  map.addLayer({
    id: "spiderfy-lines",
    type: "line",
    source: "spiderfy-lines-source",
    paint: {
      'line-color': '#000000',
      'line-width': 1,
      'line-opacity': 0.3
    }
  });
  map.addSource("spiderfy-pins-source", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
    cluster: false
  });
  map.addLayer({
    id: "spiderfy-pins",
    type: "symbol",
    source: "spiderfy-pins-source"
  });
  addLayerPopup(map, "spiderfy-pins", "popup");
}

/**
 * Update the coordinates of cluster features to spiderfy them around a center point.
 * 
 * @param {object} map                  Maplibre map instance.
 * @param {object[]} features           Cluster features to spiderfy.
 * @param {int[]} centerLngLat          Cluster center coordinates as [lng, lat].
 * @param {number} [maxCircleCount=50]  Initial radius in pixels for the spiderfy circles.
 * @param {number} [maxCircleCount=40]  Distance in pixels between points in the spiral.
 * @param {number} [maxCircleCount=10]  Max number of points to have in a circle before switching
 *                                      to a spiral pattern.
 * @returns {object[]}                  Cluster features with updated coordinates for spiderfying.
 */
function getSpiderfiedFeatures(map, features, centerLngLat, baseRadiusPx = 50, spacing = 40, maxCircleCount = 10) {
  const center = map.project(centerLngLat);
  const result = [];
  const total = features.length;

  if (total <= maxCircleCount) {
    // Simple circle
    const angleStep = (2 * Math.PI) / total;

    for (let i = 0; i < total; i++) {
      const angle = i * angleStep;
      const x = center.x + baseRadiusPx * Math.cos(angle);
      const y = center.y + baseRadiusPx * Math.sin(angle);
      const coord = map.unproject([x, y]);

      const feature = structuredClone(features[i]);
      feature.geometry.coordinates = [coord.lng, coord.lat];
      result.push(feature);
    }
  } else {
    // Spiral with constant arc length between points
    let θ = 0;
    const b0 = 5;        // base growth
    const bGrowth = 0.1; // growth per radian

    for (let i = 0; i < total; i++) {
      const currentB = b0 + bGrowth * θ;
      const r = baseRadiusPx + currentB * θ;
      const x = center.x + r * Math.cos(θ);
      const y = center.y + r * Math.sin(θ);
      const coord = map.unproject([x, y]);

      const feature = structuredClone(features[i]);
      feature.geometry.coordinates = [coord.lng, coord.lat];
      result.push(feature);

      // Approximate next Δθ to maintain constant arc length
      const dθ = spacing / Math.sqrt(currentB * currentB + r * r);
      θ += dθ;
    }
  }
  return result;
}

/**
 * Get the GeoJSON data for the lines used in the spiderfied cluster.
 * 
 * @param {number[]} center   Cluster center coordinates as [lng, lat].
 * @param {object[]} features Spiderfied cluster features.
 * @returns {object}          GeoJSON FeatureCollection with spiderfy lines.
 */
function getSpiderfyLines(center, features) {
  return {
    type: "FeatureCollection",
    features: features.map(f => ({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          center,
          f.geometry.coordinates
        ]
      }
    }))
  };
}

/**
 * Perform actions when a cluster is clicked on the map.
 * If the cluster is clicked at max zoom, it will spiderfy the points.
 * Otherwise, it will zoom in on the cluster.
 * 
 * @param {object} e        Map click event.
 * @param {object} el       HTML widget element containing the map instance.
 * @param {string} layerId  Layer ID that the clusters belong to.
 * @param {string} sourceId Source ID of the cluster.
 * @returns {void}
 *
 * @see {@link closeSpiderfy}
 * @see {@link getSpiderfiedFeatures}
 * @see {@link getSpiderfyLines}
 * @see {@link copyLayerStyle}
 */
async function onClusterClick(e, el, layerId, sourceId) {
  closeSpiderfy(el.mapInstance); // Close any open cluster before opening a new one

  // Get the cluster that was clicked
  const features = el.mapInstance.queryRenderedFeatures(e.point, {
    layers: [`${layerId}-clusters`]
  });
  const clusterId = features[0].properties.cluster_id;

  // Cluster clicked on max zoom - toggle spiderfy
  if (el.mapInstance.getZoom() >= el.maxZoom) {
    if (el.openClusterId === clusterId) {
      el.openClusterId = null; // Click was to close spiderfy
      return;
    }

    el.openClusterId = clusterId; // Store the currently open cluster ID
    const clusterCoords = features[0].geometry.coordinates;

    // Get all features that are in the cluster
    var clusterFeatures = await el.mapInstance.getSource(sourceId).getClusterLeaves(clusterId, 200);
    // Copy the features and change coords for spiderfying
    const spiderfyiedFeatures = getSpiderfiedFeatures(el.mapInstance, clusterFeatures, clusterCoords);
    // Get the lines between the spiderfied points
    const spiderfyLines = getSpiderfyLines(clusterCoords, spiderfyiedFeatures);
    el.mapInstance.getSource('spiderfy-lines-source').setData(spiderfyLines);
    el.mapInstance.getSource('spiderfy-pins-source').setData({
      type: 'FeatureCollection',
      features: spiderfyiedFeatures
    });
    copyLayerStyle(el.mapInstance, layerId, 'spiderfy-pins'); // Make sure the style matches the original layer
    return;
  }
  // Zoom in on the cluster
  var clusterFeatures = await el.mapInstance.getSource(sourceId).getClusterLeaves(clusterId, 200);
  const bounds = getPointFeaturesBounds(clusterFeatures);
  if (bounds) {
    el.mapInstance.fitBounds(bounds, { padding: 100, duration: 500 });
  }
}

/**
 * Turn clustering on/off for a specfic layer in a MapLibre map.
 *
 * @param {object} map      A MapLibre map instance.
 * @param {string} layerId  Layer ID to toggle clustering for.
 * @param {boolean} enable  Enable or disable clustering for the layer.
 * @returns {void}
 *
 * @see {@link addFilterToLayer}
 */
function toggleLayerClustering(map, layerId, enable) {
  const layer = map.getLayer(layerId);
  if (layer) {
    const sourceId = layer.source; // Assuming layerId is the source ID
    map.getSource(sourceId).setClusterOptions({ cluster: enable });

    if (enable) {
      addFilterToLayer(map, layerId, ["!", ['has', 'point_count']]);
    } else {
      addFilterToLayer(map, layerId, null); // Remove filter to show all points
    }
    const visibility = enable ? 'visible' : 'none';
    map.setLayoutProperty(`${layerId}-clusters`, 'visibility', visibility);
    map.setLayoutProperty(`${layerId}-cluster-count`, 'visibility', visibility);
  }
}

/**
 * Clear the spiderfy layer data to close any open spiderfy clusters.
 * 
 * @param {object} map Maplibre map instance.
 * @returns {void}
 */
function closeSpiderfy(map) {
  map.getSource("spiderfy-pins-source").setData({
    type: "FeatureCollection",
    features: []
  });
  map.getSource("spiderfy-lines-source").setData({
    type: "FeatureCollection",
    features: []
  });
  // Hide any open spiderfy popup
  if (map._popup) {
    map._popup.remove();
    map._popup = null;
  }
}
