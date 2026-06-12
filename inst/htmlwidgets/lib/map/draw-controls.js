function normalizeDrawGeometryPayload(geometry) {
  if (!geometry) {
    return null;
  }

  // Accept JSON strings sent over custom messages
  if (typeof geometry === 'string') {
    try {
      geometry = JSON.parse(geometry);
    } catch (e) {
      console.warn('addDrawnShape: invalid geometry JSON string', e);
      return null;
    }
  }

  // Legacy payload support from tabular serialisation:
  // { geometry: [<geom>, ...], id: [<id>, ...] }
  if (!geometry.type && Array.isArray(geometry.geometry)) {
    const ids = Array.isArray(geometry.id) ? geometry.id : [];
    const features = geometry.geometry.map((geom, index) => {
      const feature = {
        type: 'Feature',
        geometry: geom,
        properties: {},
      };

      if (ids[index] !== undefined && ids[index] !== null) {
        feature.id = String(ids[index]);
      }

      return feature;
    });

    return { type: 'FeatureCollection', features };
  }

  const promoteFeatureId = (feature) => {
    if (!feature || feature.type !== 'Feature') {
      return feature;
    }

    if ((feature.id === undefined || feature.id === null) && feature.properties?.id !== undefined) {
      feature.id = String(feature.properties.id);
    } else if (feature.id !== undefined && feature.id !== null) {
      feature.id = String(feature.id);
    }

    return feature;
  };

  if (geometry.type === 'FeatureCollection' && Array.isArray(geometry.features)) {
    geometry.features = geometry.features.map(promoteFeatureId);
    return geometry;
  }

  if (geometry.type === 'Feature') {
    return promoteFeatureId(geometry);
  }

  return geometry;
}

/**
 * Add a shape to the map as a drawn shape object.
 */
function addDrawnShape(widgetInstance, geometry) {
  const drawObject = widgetInstance.getDraw();
  const normalizedGeometry = normalizeDrawGeometryPayload(geometry);

  if (!normalizedGeometry) {
    return;
  }

  try {
    // Accept a FeatureCollection, a single Feature, or an array of Features
    if (Array.isArray(normalizedGeometry)) {
      drawObject.add({ type: 'FeatureCollection', features: normalizedGeometry });
    } else if (normalizedGeometry.type === 'FeatureCollection') {
      drawObject.add(normalizedGeometry);
    } else {
      drawObject.add(normalizedGeometry); // single Feature
    }
    updateAllDrawnFeatures(widgetInstance);
  } catch (e) {
    console.warn('addDrawnShape: failed to add/update drawn shape', e);
  }
}

// Update a Shiny input to hold all current drawn shape data
function updateAllDrawnFeatures(widgetInstance) {
  const allFeatures = widgetInstance.getDraw().getAll();
  const allGeoJSON = JSON.stringify(allFeatures);
  Shiny.setInputValue(widgetInstance.id + '_all_drawn_shapes', allGeoJSON, {
    priority: 'event',
  });
}
