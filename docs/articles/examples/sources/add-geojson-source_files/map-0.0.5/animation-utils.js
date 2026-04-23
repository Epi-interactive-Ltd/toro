// ===========================================
// Utility Functions for Map Animations
// ===========================================

/**
 * Create a GeoJSON FeatureCollection with a single point feature
 * @param {Array} coordinates - [longitude, latitude]
 * @param {Object} properties - Feature properties
 * @returns {Object} GeoJSON FeatureCollection
 */
function createPointFeatureCollection(coordinates, properties = {}) {
  return createFeatureCollection([createPointFeature(coordinates, properties)]);
}

/**
 * Create a GeoJSON LineString feature
 * @param {Array} coordinates - Array of [longitude, latitude] pairs
 * @param {Object} properties - Feature properties
 * @returns {Object} GeoJSON Feature
 */
function createLineFeature(coordinates, properties = {}) {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: coordinates,
    },
    properties: properties,
  };
}

/**
 * Create a GeoJSON Point feature
 * @param {Array} coordinates - [longitude, latitude] coordinate pair
 * @param {Object} properties - Feature properties
 * @returns {Object} GeoJSON Feature
 */
function createPointFeature(coordinates, properties = {}) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: coordinates,
    },
    properties: properties,
  };
}

/**
 * Create a GeoJSON FeatureCollection
 * @param {Array} features - Array of GeoJSON features
 * @returns {Object} GeoJSON FeatureCollection
 */
function createFeatureCollection(features) {
  return {
    type: 'FeatureCollection',
    features: features,
  };
}

/**
 * Generate animation points using the exact coordinates from the route line geometry
 * This ensures perfect alignment with the rendered route line
 * @param {Array} flatCoords - Array of [lon,lat] coordinate pairs (fallback)
 * @param {number} totalSteps - Total number of animation steps
 * @param {Object} line - GeoJSON LineString feature to extract coordinates from
 * @returns {Array} Array of point features for animation
 */
function generateLinePoints(flatCoords, totalSteps, line = null) {
  const linePoints = [];

  // Use the exact coordinates from the route line geometry if available
  let routeCoords = flatCoords;
  if (
    line &&
    line.geometry &&
    line.geometry.coordinates &&
    line.geometry.coordinates.length > flatCoords.length
  ) {
    routeCoords = line.geometry.coordinates;
  }

  // If we have many coordinates, use them directly with minimal additional interpolation
  if (routeCoords.length >= totalSteps * 0.5) {
    // Use the route coordinates directly, adding minimal interpolation if needed
    const coordsPerStep = routeCoords.length / totalSteps;

    for (let i = 0; i < totalSteps; i++) {
      const coordIndex = Math.floor(i * coordsPerStep);
      const actualIndex = Math.min(coordIndex, routeCoords.length - 1);
      linePoints.push(createPointFeature(routeCoords[actualIndex]));
    }
  } else {
    // Use distance-based sampling with minimal safe interpolation

    // Calculate cumulative distances along all route coordinates
    const distances = [0];
    let totalDistance = 0;

    for (let i = 1; i < routeCoords.length; i++) {
      const segmentLine = createLineFeature([routeCoords[i - 1], routeCoords[i]]);
      const segmentDistance = turf.length(segmentLine, { units: 'kilometers' });
      totalDistance += segmentDistance;
      distances.push(totalDistance);
    }

    // Sample points at equal distance intervals
    const stepDistance = totalDistance / (totalSteps - 1);

    for (let step = 0; step < totalSteps; step++) {
      const targetDistance = step * stepDistance;

      // Find which route segment this distance falls in
      let segmentIndex = 0;
      for (let i = 1; i < distances.length; i++) {
        if (distances[i] >= targetDistance) {
          segmentIndex = i - 1;
          break;
        }
      }

      // Handle final point
      if (step === totalSteps - 1) {
        linePoints.push(createPointFeature(routeCoords[routeCoords.length - 1]));
        continue;
      }

      // Calculate position within the segment
      const segmentStart = distances[segmentIndex];
      const segmentEnd = distances[segmentIndex + 1];
      const segmentLength = segmentEnd - segmentStart;

      if (segmentLength === 0) {
        linePoints.push(createPointFeature(routeCoords[segmentIndex]));
      } else {
        // Only do VERY simple linear interpolation between consecutive route coordinates
        const t = (targetDistance - segmentStart) / segmentLength;
        const coord1 = routeCoords[segmentIndex];
        const coord2 = routeCoords[segmentIndex + 1];

        // Simple linear interpolation - since route coordinates should be close together
        let startLon = coord1[0];
        let endLon = coord2[0];

        // Handle antimeridian crossing
        const lonDiff = endLon - startLon;
        if (lonDiff > 180) {
          startLon += 360;
        } else if (lonDiff < -180) {
          endLon += 360;
        }

        let lon = startLon + t * (endLon - startLon);
        const lat = coord1[1] + t * (coord2[1] - coord1[1]);

        // Normalize longitude
        while (lon > 180) lon -= 360;
        while (lon < -180) lon += 360;

        linePoints.push(createPointFeature([lon, lat]));
      }
    }
  }

  return linePoints;
}

/**
 * Normalize coordinates for LineString geometry
 * @param {Array} rawCoords - Raw coordinate array that may be over-nested
 * @returns {Array} Flat array of [lon,lat] coordinate pairs
 */
function normalizeCoordinatesForLineString(rawCoords) {
  // If we have an array of individual point coordinates [[lon,lat], [lon,lat], ...]
  if (
    Array.isArray(rawCoords) &&
    rawCoords.length > 0 &&
    Array.isArray(rawCoords[0]) &&
    typeof rawCoords[0][0] === 'number'
  ) {
    return rawCoords;
  }

  // If we have over-nested arrays, flatten them
  let workingCoords = rawCoords;
  let maxDepth = 5; // Prevent infinite loops

  while (maxDepth-- > 0) {
    // If we have a single array containing the actual coordinate array
    if (
      Array.isArray(workingCoords) &&
      workingCoords.length === 1 &&
      Array.isArray(workingCoords[0])
    ) {
      // Check if the inner array looks like coordinate pairs
      const inner = workingCoords[0];
      if (Array.isArray(inner) && inner.length > 0) {
        // If inner[0] is a coordinate pair [lon, lat]
        if (
          Array.isArray(inner[0]) &&
          inner[0].length === 2 &&
          typeof inner[0][0] === 'number' &&
          typeof inner[0][1] === 'number'
        ) {
          return inner;
        }
        // If inner itself contains more nesting, continue flattening
        else if (Array.isArray(inner[0])) {
          workingCoords = inner;
          continue;
        }
      }
      break;
    } else {
      break;
    }
  }

  // If we couldn't normalize, throw an error with helpful info
  console.error('Could not normalize coordinates. Raw structure:', rawCoords);
  throw new Error(
    'Invalid coordinate structure for LineString. Expected array of [lon,lat] pairs.'
  );
}

/**
 * Update point position in animation
 * @param {Object} map - MapLibre map instance
 * @param {string} layerId - Layer ID for the animated point
 * @param {Array} coordinates - [longitude, latitude]
 * @param {Object} properties - Feature properties
 * @return {void}
 */
function updateAnimatedPointPosition(map, layerId, coordinates, properties = {}) {
  const pointData = createPointFeatureCollection(coordinates, properties);
  map.getSource(layerId).setData(pointData);
}

// ===========================================
// Main Functions
// ===========================================

/**
 * Add a route to the map for animation.
 *
 * @param {object} el The HTML element containing the map widget.
 * @param {object} routeOptions   Options for the route to add.
 * @return {void}
 */
function addRoute(el, routeOptions) {
  const widgetInstance = el.widgetInstance;
  const map = widgetInstance.getMap();
  if (!map) return;

  const { points, options = {}, routeId = 'route' } = routeOptions;
  const routeLineLayerId = `${routeId}_route_line`;
  const routePointLayerId = `${routeId}_route_point`;
  const routeVisitedPointsLayerId = `${routeId}_route_visited_point`;

  // Check for existing route
  if (widgetInstance.getAnimations() && widgetInstance.getAnimations()[routeId]) {
    console.error('Route with this ID already exists:', routeId);
    return;
  }

  // Extract and normalize coordinates
  // Handle both individual points and linestring geometries
  let flatCoords;
  if (points.features.length === 1 && points.features[0].geometry.type === 'LineString') {
    // Single linestring - use coordinates directly
    flatCoords = points.features[0].geometry.coordinates;
  } else {
    // Multiple point features - extract coordinates from each
    const rawCoords = points.features.map((f) => f.geometry.coordinates);
    flatCoords = normalizeCoordinatesForLineString(rawCoords);
  }

  // Create geometric features
  const line = createLineFeature(flatCoords);
  const route = createFeatureCollection([line]);
  const initialPoint = createPointFeatureCollection(
    flatCoords[0],
    points.features[0]?.properties || {}
  );
  // const point = createFeatureCollection([points.features[0]]);

  // Calculate animation parameters
  const totalLength = turf.length(line, { units: 'kilometers' });
  // Number of steps to use in the arc and animation, more steps means
  // a smoother arc and animation, but too many steps will result in a
  // low frame rate
  const steps = options.steps || 500;
  const linePoints = generateLinePoints(flatCoords, steps, line);

  // Initialize animations object
  const animations = widgetInstance.getAnimations();
  if (!animations) {
    console.warn('Animations object not initialized, this might indicate a setup issue');
    return;
  }

  const showTimelineControls =
    options.showTimelineControls || (false && 'date' in points.features[0].properties);

  const showSpeedControl = options.showSpeedControl || false;

  animations[routeId] = {
    isAnimating: false,
    animationFrameId: null,
    showTimelineControls: showTimelineControls,
    showSpeedControl: showSpeedControl,
    counter: 0,
    totalLength: totalLength,
    steps: steps,
    animationSpeed: options.animationSpeed || 1.0,
    lastFrameTime: 0,
    dropVisited: options.dropVisited || false,
    line: line,
    linePoints: linePoints,
    coords: flatCoords,
    points: points,
    map: map,
    routeLineLayerId: routeLineLayerId,
    routePointLayerId: routePointLayerId,
    visitedLayerId: routeVisitedPointsLayerId,
    visitedPoints: createFeatureCollection([]),
    options: options,
  };

  // Add map layers
  addRouteLineLayers(
    map,
    routeLineLayerId,
    routeVisitedPointsLayerId,
    route,
    animations[routeId].visitedPoints,
    options
  );
  addRoutePointLayer(map, routePointLayerId, initialPoint, options);

  // Setup controls if needed
  setupRouteControls(el, widgetInstance, routeOptions, routeId, animations[routeId]);
}

/**
 * Add route line and visited points layers to the map
 * @param {Object} map - MapLibre map instance
 * @param {string} routeLineLayerId - Route line layer ID
 * @param {string} visitedPointsLayerId - Visited points layer ID
 * @param {Object} routeData - Route GeoJSON data
 * @param {Object} visitedPointsData - Visited points GeoJSON data
 * @param {Object} options - Layer styling options
 */
function addRouteLineLayers(
  map,
  routeLineLayerId,
  visitedPointsLayerId,
  routeData,
  visitedPointsData,
  options
) {
  // Add route line layer
  map.addLayer({
    id: routeLineLayerId,
    type: 'line',
    source: { type: 'geojson', data: routeData },
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': options.routeLine?.['line-color'] ?? '#01656c',
      'line-width': options.routeLine?.['line-width'] ?? 3,
      'line-dasharray': options.routeLine?.['line-dasharray'] ?? [1, 0],
      'line-opacity': options.routeLine?.['line-opacity'] ?? 1.0,
    },
  });

  // Add visited points layer
  map.addLayer({
    id: visitedPointsLayerId,
    type: 'circle',
    source: { type: 'geojson', data: visitedPointsData },
    paint: {
      'circle-color': options.visitedPoints?.['circle-color'] ?? '#01656c',
      'circle-radius': options.visitedPoints?.['circle-radius'] ?? 4,
      'circle-opacity': options.visitedPoints?.['circle-opacity'] ?? 1.0,
      'circle-stroke-width': options.visitedPoints?.['circle-stroke-width'] ?? 2,
      'circle-stroke-color':
        options.visitedPoints?.['circle-stroke-color'] ??
        options.visitedPoints?.['circle-color'] ??
        '#01656c',
    },
  });
}

/**
 * Add animated point layer (circle or symbol) to the map
 * @param {Object} map - MapLibre map instance
 * @param {string} layerId - Point layer ID
 * @param {Object} pointData - Initial point GeoJSON data
 * @param {Object} options - Layer styling options
 */
function addRoutePointLayer(map, layerId, pointData, options) {
  if (options.animatingIcon) {
    // Add symbol layer for icon
    map.addLayer({
      id: layerId,
      type: 'symbol',
      source: { type: 'geojson', data: pointData },
      paint: {
        'icon-opacity': options.animatingIcon?.['icon-opacity'] ?? 1.0,
        'text-color': options.animatingIcon?.['text-color'] ?? '#000000',
      },
      layout: {
        'icon-allow-overlap': options.animatingIcon?.['icon-allow-overlap'] ?? true,
        'icon-image': options.animatingIcon?.['icon-image'] ?? 'marker-15',
        'icon-size': options.animatingIcon?.['icon-size'] ?? 1.0,
        'icon-anchor': options.animatingIcon?.['icon-anchor'] ?? 'center',
        'icon-offset': options.animatingIcon?.['icon-offset'] ?? [0, 0],
        'icon-rotate': options.animatingIcon?.['icon-rotate'] ?? 0,
        'text-font': options.animatingIcon?.['text-font'] ?? ['Open Sans Bold'],
        'text-size': options.animatingIcon?.['text-size'] ?? 12,
        'text-field': options.animatingIcon?.['text-field'] ?? '',
      },
    });
  } else {
    // Add circle layer
    map.addLayer({
      id: layerId,
      type: 'circle',
      source: { type: 'geojson', data: pointData },
      paint: {
        'circle-color': options.animatingPoint?.['circle-color'] ?? '#01656c',
        'circle-radius': options.animatingPoint?.['circle-radius'] ?? 6,
        'circle-opacity': options.animatingPoint?.['circle-opacity'] ?? 1.0,
        'circle-stroke-width': options.animatingPoint?.['circle-stroke-width'] ?? 2,
        'circle-stroke-color':
          options.animatingPoint?.['circle-stroke-color'] ??
          options.animatingPoint?.['circle-color'] ??
          '#01656c',
      },
    });
  }
}

/**
 * Setup route controls (timeline, speed, popups, panels)
 * @param {Object} el - HTML element containing the map widget
 * @param {Object} widgetInstance - Map widget instance
 * @param {Object} routeOptions - Route options
 * @param {string} routeId - Route identifier
 * @param {Object} routeState - Animation state object
 */
function setupRouteControls(el, widgetInstance, routeOptions, routeId, routeState) {
  const { options = {}, points } = routeOptions;
  const { map } = routeState;

  // Add popups if specified
  if (options.visitedPoints?.popupColumn) {
    addLayerPopup(map, routeState.visitedLayerId, options.visitedPoints.popupColumn);
  }

  // Setup control panel if needed
  if (options.useAnimationControlPanel) {
    setupAnimationControlPanel(el, map, options.animationControlPanelOptions || {});
  }

  // Check for existing controls
  const existingTimelineControl = checkForExistingTimelineControl(widgetInstance);
  const existingSpeedControl = checkForExistingSpeedControl(widgetInstance);

  // Setup timeline controls
  if (routeState.showTimelineControls || existingTimelineControl) {
    setupTimelineControls(widgetInstance, routeOptions, routeId, existingTimelineControl, points);
  }

  // Setup speed controls
  if (routeState.showSpeedControl || existingSpeedControl) {
    setupSpeedControls(widgetInstance, routeId, existingSpeedControl);
  }
}

/**
 * Setup animation control panel
 * @param {Object} el - HTML element containing the map widget
 * @param {Object} map - MapLibre map instance
 * @param {Object} panelOptions - Panel configuration options
 */
function setupAnimationControlPanel(el, map, panelOptions) {
  const panelId = panelOptions.panelId || 'animation-controls';

  // Only create if it doesn't already exist
  if (!map._controlPanels || !map._controlPanels[panelId]) {
    addControlPanel(el, panelId, {
      title: panelOptions.title || 'Animation Controls',
      position: panelOptions.position || 'bottom-left',
      collapsible: panelOptions.collapsible !== false,
      collapsed: panelOptions.collapsed || false,
      showTitle: panelOptions.showTitle !== false,
    });
  }
}

/**
 * Setup timeline controls for route animation
 * @param {Object} widgetInstance - Map widget instance
 * @param {Object} routeOptions - Route configuration
 * @param {string} routeId - Route identifier
 * @param {Object} existingTimelineControl - Existing timeline control if any
 * @param {Object} points - Route points data
 */
function setupTimelineControls(
  widgetInstance,
  routeOptions,
  routeId,
  existingTimelineControl,
  points
) {
  const route = widgetInstance.getAnimations()[routeId];
  if (existingTimelineControl) {
    // animations[routeId].showTimelineControls = true;
    route.showTimelineControls = true;
  }

  // Get date range from route points
  const startDate = points.features[0]?.properties?.date || '2023-01-01';
  const endDate = points.features[points.features.length - 1]?.properties?.date || '2023-12-31';

  // Create animation callbacks
  const playPauseCallback = (playing) => {
    if (playing) {
      animateRoute(widgetInstance, routeOptions);
    } else {
      pauseAnimation(widgetInstance, routeOptions);
    }
  };

  const sliderCallback = (progress) => {
    const route = widgetInstance.getAnimations()[routeId];
    if (route && !route.isAnimating) {
      const targetStep = Math.floor(progress * (route.linePoints.length - 1));
      route.counter = targetStep;

      // Update point position
      const coordinates = route.linePoints[targetStep].geometry.coordinates;
      const properties = route.points.features[0]?.properties || {};
      updateAnimatedPointPosition(route.map, route.routePointLayerId, coordinates, properties);

      // Update visited points if enabled
      if (route.dropVisited) {
        updateVisitedPoints(route, targetStep);
      }
    }
  };

  if (existingTimelineControl) {
    connectTimelineControlToAnimation(
      route.map,
      existingTimelineControl,
      playPauseCallback,
      sliderCallback,
      startDate,
      endDate
    );
  } else {
    addTimelineControl(
      widgetInstance,
      startDate,
      endDate,
      playPauseCallback,
      sliderCallback,
      routeOptions.options.timelineControlOptions || {}
    );
  }
}

/**
 * Setup speed controls for route animation
 * @param {Object} widgetInstance - Map widget instance
 * @param {string} routeId - Route identifier
 * @param {Object} existingSpeedControl - Existing speed control if any
 */
function setupSpeedControls(widgetInstance, routeId, existingSpeedControl) {
  const speedChangeCallback = (speed) => {
    const route = widgetInstance.getAnimations()[routeId];
    if (route) {
      route.animationSpeed = speed;
    }
  };

  if (existingSpeedControl) {
    connectSpeedControlToAnimation(
      widgetInstance.getMap(),
      existingSpeedControl,
      speedChangeCallback
    );
  } else {
    addSpeedControl(
      widgetInstance,
      speedChangeCallback,
      widgetInstance.getAnimations()[routeId].options.speedControlOptions || {}
    );
  }
}

/**
 * Update visited points data for timeline scrubbing
 * @param {Object} route - Route animation state
 * @param {number} targetStep - Target animation step
 */
function updateVisitedPoints(route, targetStep) {
  route.visitedPoints.features = [];

  // Calculate progress based on target step
  const totalSteps = route.linePoints.length - 1;
  const progressRatio = totalSteps > 0 ? targetStep / totalSteps : 0;

  // Calculate cumulative distances to each original coordinate if not already done
  if (!route.originalCoordDistances) {
    route.originalCoordDistances = [0];
    let totalDistance = 0;

    for (let i = 1; i < route.coords.length; i++) {
      const segmentLine = createLineFeature([route.coords[i - 1], route.coords[i]]);
      const segmentDistance = turf.length(segmentLine, { units: 'kilometers' });
      totalDistance += segmentDistance;
      route.originalCoordDistances.push(totalDistance);
    }

    // Convert to ratios
    route.originalCoordDistances = route.originalCoordDistances.map((d) =>
      totalDistance > 0 ? d / totalDistance : 0
    );
  }

  // Add all original coordinates that should be visited based on target progress
  for (let i = 0; i < route.coords.length; i++) {
    if (route.originalCoordDistances[i] <= progressRatio) {
      // This original coordinate should be visited
      const coord = route.coords[i];
      const properties = route.points.features[0]?.properties || {}; // Use first point properties as fallback

      // Try to find matching properties from original point features
      if (route.points.features[i]) {
        Object.assign(properties, route.points.features[i].properties || {});
      }

      route.visitedPoints.features.push(createPointFeature(coord, properties));
    }
  }

  route.map.getSource(route.visitedLayerId).setData(route.visitedPoints);
}

/**
 * Animate the route on the map.
 *
 * @param {object} widgetInstance The map widget instance.
 * @param {object} routeOptions   Options for the route to animate.
 * @return {void}
 */
function animateRoute(widgetInstance, routeOptions) {
  const options = routeOptions.options || {};
  const routeId = routeOptions.routeId || 'route';

  const route = widgetInstance.getAnimations()[routeId];
  if (!route) {
    console.error('No route found to animate for routeId:', routeId);
    return;
  }

  // Handle restart logic: if we're at the end, restart from beginning
  const currentProgress = route.counter / (route.linePoints.length - 1);
  if (currentProgress >= 0.95) {
    route.counter = 0;

    // Clear all visited/dropped points when restarting
    if (route.dropVisited) {
      route.visitedPoints.features = [];
      route.map.getSource(route.visitedLayerId).setData(route.visitedPoints);
    }

    // Update slider and timeline control to show restart
    if (route.map._timelineControl && route.showTimelineControls) {
      const timelineSlider = document.getElementById(`timeline-slider-${widgetInstance.getId()}`);
      if (timelineSlider) {
        timelineSlider.value = 0;
        if (route.map._timelineControl.updateAppearance) {
          route.map._timelineControl.updateAppearance();
        }
      }
    }
  }

  // Ensure the point position matches the current counter position
  if (route.linePoints.length > 0) {
    // Use the same fresh point approach as in animation
    const initialPointData = createPointFeatureCollection(
      route.linePoints[route.counter].geometry.coordinates,
      route.points.features[0]?.properties || {}
    );
    route.map.getSource(route.routePointLayerId).setData(initialPointData);
  }

  // Ensure starting visited point is added when animation begins (handled by progress-based logic)
  if (route.dropVisited && route.counter === 0 && route.coords.length > 0) {
    // Initialize the visited points with the first coordinate
    if (route.visitedPoints.features.length === 0) {
      const startCoord = route.coords[0];
      route.visitedPoints.features.push(
        createPointFeature(startCoord, route.points.features[0]?.properties ?? {})
      );
      route.map.getSource(route.visitedLayerId).setData(route.visitedPoints);
    }
  }

  const startProgress = Math.round((route.counter / (route.linePoints.length - 1)) * 100);

  function animate(currentTime) {
    const state = widgetInstance.getAnimations()[routeId];
    if (!state?.isAnimating) {
      return;
    }

    // Check if animation has reached the end
    if (state.counter >= state.linePoints.length - 1) {
      // Animation finished - pause at the last point
      state.isAnimating = false;
      state.counter = state.linePoints.length - 1; // Ensure we're at the exact last point

      // Update timeline control to show paused state
      if (state.map._timelineControl && state.showTimelineControls) {
        state.map._timelineControl.setPlaying(false);
        // Set progress to 100%
        state.map._timelineControl.setProgress(1.0);
      }

      // Ensure the point is at the final position
      if (state.linePoints.length > 0) {
        const finalPointData = createPointFeatureCollection(
          state.linePoints[state.linePoints.length - 1].geometry.coordinates,
          state.points.features[0]?.properties || {}
        );
        state.map.getSource(state.routePointLayerId).setData(finalPointData);
      }

      // Ensure the final visited point is added when animation completes (handled by progress-based logic)
      if (route.dropVisited && state.coords.length > 0) {
        // Make sure all coordinates are marked as visited when animation is complete
        const allCoords = state.coords.map((coord, index) => {
          const properties = state.points.features[0]?.properties || {};
          if (state.points.features[index]) {
            Object.assign(properties, state.points.features[index].properties || {});
          }
          return createPointFeature(coord, properties);
        });

        state.visitedPoints.features = allCoords;
        state.map.getSource(state.visitedLayerId).setData(state.visitedPoints);
      }

      return;
    }

    // Initialize timing
    if (state.lastFrameTime === 0) {
      state.lastFrameTime = currentTime;
    }

    const deltaTime = currentTime - state.lastFrameTime;
    const baseStepTime = 16.67; // ~60 FPS base timing (1000ms / 60fps)

    // Calculate how much to advance based on speed and time elapsed
    const speedMultiplier = state.animationSpeed || 1.0;
    const stepsToAdvance = (deltaTime / baseStepTime) * speedMultiplier;

    // Only advance if enough time has passed
    if (stepsToAdvance >= 1) {
      const integerSteps = Math.floor(stepsToAdvance);
      const oldCounter = state.counter;
      state.counter = Math.min(state.counter + integerSteps, state.linePoints.length - 1);
      state.lastFrameTime = currentTime;
      routeOptions = route.options;

      // Calculate horizontal direction for icon flipping
      if (
        state.counter > oldCounter &&
        routeOptions.animatingIcon &&
        routeOptions.animatingIcon['icon-flip-horizontal']
      ) {
        const currentCoord = state.linePoints[state.counter].geometry.coordinates;
        const previousCoord = state.linePoints[oldCounter].geometry.coordinates;

        // Check if moving left (westward) or right (eastward)
        const movingLeft = currentCoord[0] < previousCoord[0];

        // Store the original image name if not already stored
        if (!state.originalIconImage) {
          state.originalIconImage = routeOptions.animatingIcon['icon-image'];
        }

        // Try to use different images for left/right if available
        // Convention: if original image is "arrow", look for "arrow-left" and "arrow-right"
        const baseImageName = state.originalIconImage;
        let targetImage;

        if (movingLeft) {
          // Try to find a left-facing version of the icon
          targetImage = baseImageName + '-left';
          // Check if this image exists in the map style
          if (!state.map.hasImage(targetImage)) {
            // Fallback: use the original image but rotated 180 degrees
            targetImage = baseImageName;
            state.map.setLayoutProperty(state.routePointLayerId, 'icon-rotate', 180);
          } else {
            // Reset rotation if using a dedicated left image
            state.map.setLayoutProperty(state.routePointLayerId, 'icon-rotate', 0);
          }
        } else {
          // Try to find a right-facing version of the icon
          targetImage = baseImageName + '-right';
          // Check if this image exists in the map style
          if (!state.map.hasImage(targetImage)) {
            // Fallback: use the original image with no rotation
            targetImage = baseImageName;
            state.map.setLayoutProperty(state.routePointLayerId, 'icon-rotate', 0);
          } else {
            // Use the dedicated right image
            state.map.setLayoutProperty(state.routePointLayerId, 'icon-rotate', 0);
          }
        }

        // Update the icon image
        state.map.setLayoutProperty(state.routePointLayerId, 'icon-image', targetImage);
      }

      // Move the animated point - Instead of modifying existing point, create a fresh one each frame
      const newPointData = createPointFeatureCollection(
        state.linePoints[state.counter].geometry.coordinates,
        state.points.features[0]?.properties || {}
      );
      try {
        state.map.getSource(state.routePointLayerId).setData(newPointData);
      } catch (error) {
        console.error('Error setting fresh point data:', error);
      }

      if (route.dropVisited) {
        // Track visited points based on animation progress rather than coordinate matching
        // Calculate which original coordinates should be visited based on current progress
        const totalSteps = state.linePoints.length - 1;
        const progressRatio = totalSteps > 0 ? state.counter / totalSteps : 0;

        // Calculate cumulative distances to each original coordinate
        if (!state.originalCoordDistances) {
          state.originalCoordDistances = [0];
          let totalDistance = 0;

          for (let i = 1; i < state.coords.length; i++) {
            const segmentLine = createLineFeature([state.coords[i - 1], state.coords[i]]);
            const segmentDistance = turf.length(segmentLine, { units: 'kilometers' });
            totalDistance += segmentDistance;
            state.originalCoordDistances.push(totalDistance);
          }

          // Convert to ratios
          state.originalCoordDistances = state.originalCoordDistances.map((d) =>
            totalDistance > 0 ? d / totalDistance : 0
          );
        }

        // Add all original coordinates that should be visited based on current progress
        const newVisitedPoints = [];
        for (let i = 0; i < state.coords.length; i++) {
          if (state.originalCoordDistances[i] <= progressRatio) {
            // This original coordinate should be visited
            const coord = state.coords[i];
            const properties = state.points.features[0]?.properties || {}; // Use first point properties as fallback

            // Try to find matching properties from original point features
            if (state.points.features[i]) {
              Object.assign(properties, state.points.features[i].properties || {});
            }

            newVisitedPoints.push(createPointFeature(coord, properties));
          }
        }

        // Update visited points if there are changes
        if (newVisitedPoints.length > state.visitedPoints.features.length) {
          state.visitedPoints.features = newVisitedPoints;
          state.map.getSource(state.visitedLayerId).setData(state.visitedPoints);
        }
      }

      // Update timeline slider progress
      if (state.map._timelineControl && state.showTimelineControls) {
        const progress = state.counter / (state.linePoints.length - 1);
        state.map._timelineControl.setProgress(progress);
      }
    }

    state.animationFrameId = requestAnimationFrame(animate);
  }

  widgetInstance.getAnimations()[routeId].isAnimating = true;

  // Reset timing when starting/resuming animation to prevent time jumps
  widgetInstance.getAnimations()[routeId].lastFrameTime = 0;

  // Start the animation loop
  requestAnimationFrame(animate);
}

/**
 * Pause the route animation on the map.
 *
 * @param {object} widgetInstance The map widget instance.
 * @param {object} routeOptions   Options for the route to pause.
 * @return {void}
 */
function pauseAnimation(widgetInstance, routeOptions) {
  const routeId = routeOptions.routeId || 'route';

  if (widgetInstance.getAnimations()[routeId]) {
    const route = widgetInstance.getAnimations()[routeId];
    route.isAnimating = false;

    if (route.animationFrameId) {
      cancelAnimationFrame(route.animationFrameId);
      route.animationFrameId = null;
    }

    // Update timeline control if it exists
    if (route.map._timelineControl && route.showTimelineControls) {
      route.map._timelineControl.setPlaying(false);
    }
  }
}

/**
 * Remove the route animation from the map and clean up resources.
 *
 * @param {object} widgetInstance The map widget instance.
 * @param {object} routeOptions   Options for the route to remove.
 * @return {void}
 */
function removeRoute(widgetInstance, routeOptions) {
  const routeId = routeOptions.routeId || 'route';

  const route = widgetInstance.getAnimations()[routeId];
  if (!route) {
    console.error('No route found to animate for routeId:', routeId);
    return;
  }
  const map = widgetInstance.getMap();
  const routeLineLayerId = route.routeLineLayerId;
  const routePointLayerId = route.routePointLayerId;
  const routeVisitedPointsLayerId = route.visitedLayerId;
  // Remove layers if they exist
  [routeLineLayerId, routePointLayerId, routeVisitedPointsLayerId].forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  });

  // Remove sources if they exist
  [routeLineLayerId, routePointLayerId, routeVisitedPointsLayerId].forEach((sourceId) => {
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }
  });

  if (route.showTimelineControls && map._timelineControl) {
    removeControl(widgetInstance, map._timelineControl.controlId || 'toro-timeline-control');
  }

  if (route.showSpeedControl && map._speedControl) {
    removeControl(widgetInstance, 'toro-speed-control');
  }

  // Remove animation state
  if (widgetInstance.getAnimations()[routeId]) {
    delete widgetInstance.getAnimations()[routeId];
  }
}

/**
 * Check for existing timeline control in control panels
 *
 * @param {object} widgetInstance The widget instance
 * @returns {object|null} Timeline control element or null if not found
 */
function checkForExistingTimelineControl(widgetInstance) {
  const timelineSlider = document.getElementById(`timeline-slider-${widgetInstance.getId()}`);
  const playPauseBtn = document.getElementById(`timeline-play-pause-${widgetInstance.getId()}`);

  if (timelineSlider && playPauseBtn) {
    return { slider: timelineSlider, playPauseBtn: playPauseBtn };
  }
  return null;
}

/**
 * Check for existing speed control in control panels
 *
 * @param {object} widgetInstance The widget instance
 * @returns {object|null} Speed control element or null if not found
 */
function checkForExistingSpeedControl(widgetInstance) {
  const speedSlider = document.getElementById(`speed-slider-${widgetInstance.getId()}`);

  if (speedSlider) {
    return { slider: speedSlider };
  }
  return null;
}

/**
 * Connect an existing timeline control to animation callbacks
 *
 * @param {object} map The map instance
 * @param {object} timelineControl The timeline control elements
 * @param {function} playPauseCallback Callback for play/pause events
 * @param {function} sliderCallback Callback for slider changes
 * @param {string} startDate Start date for the timeline
 * @param {string} endDate End date for the timeline
 */
function connectTimelineControlToAnimation(
  map,
  timelineControl,
  playPauseCallback,
  sliderCallback,
  startDate,
  endDate
) {
  const { slider, playPauseBtn } = timelineControl;

  // Check if timeline was previously disabled and enable it
  if (map._timelineControl && map._timelineControl.isDisabled) {
    map._timelineControl.enable(playPauseCallback, sliderCallback);
  } else {
    // Enable the controls if they were disabled
    if (slider.disabled) {
      slider.disabled = false;
      slider.style.opacity = '1';
      slider.style.cursor = 'pointer';
    }

    if (playPauseBtn.disabled) {
      playPauseBtn.disabled = false;
      playPauseBtn.style.opacity = '1';
      playPauseBtn.style.cursor = 'pointer';
    }
  }

  // Update timeline control date range to match the route dates
  if (map._timelineControl && map._timelineControl.updateDateRange) {
    map._timelineControl.updateDateRange(startDate, endDate, 3);
  }

  // Remove existing event listeners to avoid duplicates
  const oldOnClick = playPauseBtn.onclick;
  const oldOnInput = slider.oninput;

  playPauseBtn.onclick = null;
  slider.oninput = null;

  // Add new event listeners
  let playing = false;

  // Store the original setPlaying method and enhance it
  const originalSetPlaying = map._timelineControl?.setPlaying;
  if (map._timelineControl) {
    map._timelineControl.setPlaying = function (isPlaying) {
      playing = isPlaying; // Update our local playing variable
      if (originalSetPlaying) {
        originalSetPlaying.call(this, isPlaying); // Call the original method
      } else {
        // Fallback if no original method exists
        if (playPauseBtn) {
          playPauseBtn.innerHTML = playing ? '⏸' : '▶';
        }
        if (slider) {
          slider.disabled = playing;
          slider.style.opacity = playing ? '0.5' : '1';
          slider.style.cursor = playing ? 'not-allowed' : 'pointer';
        }
      }
    };
  }

  // Note: Play/pause event handling is managed by the timeline control's handlePlayPause function
  // which calls the playPauseCallback. No additional event listener needed here.

  slider.addEventListener('input', function (e) {
    e.stopPropagation();

    if (!playing) {
      const progress = parseFloat(this.value) / 100;
      sliderCallback(progress);
    }
  });

  // Store reference for external access
  if (!map._timelineControl) {
    map._timelineControl = {
      playPauseBtn: playPauseBtn,
      slider: slider,
      setProgress: function (progress) {
        if (slider) {
          const oldOnInput = slider.oninput;
          slider.oninput = null;
          slider.value = Math.round(progress * 100);
          slider.oninput = oldOnInput;
        }
      },
      setPlaying: function (isPlaying) {
        playing = isPlaying;
        if (playPauseBtn) {
          playPauseBtn.innerHTML = playing ? '⏸' : '▶';
        }
        if (slider) {
          slider.disabled = playing;
          slider.style.opacity = playing ? '0.5' : '1';
          slider.style.cursor = playing ? 'not-allowed' : 'pointer';
        }
      },
    };
  }
}

/**
 * Connect an existing speed control to animation callback
 *
 * @param {object} map The map instance
 * @param {object} speedControl The speed control elements
 * @param {function} speedChangeCallback Callback for speed changes
 */
function connectSpeedControlToAnimation(map, speedControl, speedChangeCallback) {
  const { slider } = speedControl;

  // Enable the control if it was disabled using the proper enable method
  if (map._speedControl && typeof map._speedControl.enable === 'function') {
    map._speedControl.enable(speedChangeCallback);
  } else {
    // Fallback: Enable the control manually if enable method not available
    if (slider.disabled) {
      slider.disabled = false;
      slider.style.opacity = '1';
      slider.style.cursor = 'pointer';
    }
  }

  // Remove existing event listener to avoid duplicates
  const oldOnInput = slider.oninput;
  slider.oninput = null;

  // Add new event listener
  slider.addEventListener('input', function (e) {
    e.preventDefault();
    e.stopPropagation();

    const sliderIndex = parseInt(this.value);

    // Get speed values from the stored speed control configuration
    const speedValues = map._speedControl?.speedValues || [0.5, 1, 2];
    const speed = speedValues[sliderIndex] || 1;

    speedChangeCallback(speed);
  });

  // Store reference for external access
  if (!map._speedControl) {
    map._speedControl = {
      slider: slider,
      getCurrentSpeed: function () {
        const speedValues = map._speedControl?.speedValues || [0.5, 1, 2];
        const sliderIndex = parseInt(slider.value);
        return speedValues[sliderIndex] || 1;
      },
      setSpeed: function (speed) {
        const speedValues = map._speedControl?.speedValues || [0.5, 1, 2];
        const closestIndex = speedValues.reduce((closest, current, index) => {
          return Math.abs(current - speed) < Math.abs(speedValues[closest] - speed)
            ? index
            : closest;
        }, 0);

        if (slider) {
          const oldOnInput = slider.oninput;
          slider.oninput = null;
          slider.value = closestIndex;
          slider.oninput = oldOnInput;
        }

        speedChangeCallback(speedValues[closestIndex]);
      },
    };
  }
}
