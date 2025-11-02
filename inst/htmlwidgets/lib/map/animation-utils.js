function interpolateLine(start, end, steps) {
  const points = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1); // Fraction along the line
    const lon = start[0] + t * (end[0] - start[0]);
    const lat = start[1] + t * (end[1] - start[1]);
    points.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [lon, lat] },
      properties: {},
    });
  }
  return points;
}

/**
 * Add a route to the map for animation.
 *
 * @param {object} widgetInstance The map widget instance.
 * @param {object} routeOptions   Options for the route to add.
 * @return {void}
 */
function addRoute(widgetInstance, routeOptions) {
  const map = widgetInstance.getMap();
  if (!map) return;

  const points = routeOptions.points;
  const options = routeOptions.options || {};
  const routeId = routeOptions.routeId || "route";
  const routeLineLayerId = `${routeId}_route_line`;
  const routePointLayerId = `${routeId}_route_point`;
  const routeVisitedPointsLayerId = `${routeId}_route_visited_point`;

  if (
    widgetInstance.getAnimations() &&
    widgetInstance.getAnimations()[routeId]
  ) {
    // Route with this ID already exists
    console.error("Route with this ID already exists:", routeId);
    return;
  }

  const coords = points.features.map((f) => f.geometry.coordinates);

  const line = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: coords,
    },
    properties: {},
  };

  const route = {
    type: "FeatureCollection",
    features: [line],
  };
  // A single point that animates along the route.
  // Coordinates are initially set to origin.
  const point = {
    type: "FeatureCollection",
    features: [points.features[0]],
  };

  const totalLength = turf.length(line, { units: "kilometers" });

  // Number of steps to use in the arc and animation, more steps means
  // a smoother arc and animation, but too many steps will result in a
  // low frame rate
  var steps = options.steps || 500;

  const linePoints = [];

  for (let i = 0; i < coords.length - 1; i++) {
    const lineSeg = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [coords[i], coords[i + 1]],
      },
      properties: {},
    };

    const lineLength = turf.length(lineSeg, { units: "kilometers" });
    const segmentSteps = steps * (lineLength / totalLength);
    const linePoints1 = interpolateLine(coords[i], coords[i + 1], segmentSteps);
    linePoints.push(...linePoints1);
  }

  if (!widgetInstance.getAnimations()) {
    widgetInstance.getAnimations()[routeId] = {};
  }
  const showTimelineControls =
    options.showTimelineControls ||
    (false && "date" in points.features[0].properties);

  widgetInstance.getAnimations()[routeId] = {
    isAnimating: true,
    animationFrameId: null,
    showTimelineControls: showTimelineControls,
    counter: 0,
    totalLength: totalLength,
    steps: steps,
    dropVisited: options.dropVisited || false,
    line: line,
    linePoints: linePoints,
    coords: coords,
    points: points,
    point: point,
    map: map,
    routeLineLayerId: routeLineLayerId,
    routePointLayerId: routePointLayerId,
    visitedLayerId: routeVisitedPointsLayerId,
    visitedPoints: {
      type: "FeatureCollection",
      features: [],
    },
  };

  map.addLayer({
    id: routeLineLayerId,
    type: "line",
    source: {
      type: "geojson",
      data: route,
    },
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": options.routeLine?.["line-color"] ?? "#888",
      "line-width": options.routeLine?.["line-width"] ?? 6,
      "line-dasharray": options.routeLine?.["line-dasharray"] ?? [1, 0],
      "line-opacity": options.routeLine?.["line-opacity"] ?? 1.0,
    },
  });

  map.addLayer({
    id: routeVisitedPointsLayerId,
    type: "circle",
    source: {
      type: "geojson",
      data: widgetInstance.getAnimations()[routeId].visitedPoints,
    },
    paint: {
      "circle-color": options.visitedPoints?.["circle-color"] ?? "#0074D9",
      "circle-radius": options.visitedPoints?.["circle-radius"] ?? 5,
      "circle-opacity": options.visitedPoints?.["circle-opacity"] ?? 1.0,
      "circle-stroke-width":
        options.visitedPoints?.["circle-stroke-width"] ?? 2,
      "circle-stroke-color":
        options.visitedPoints?.["circle-stroke-color"] ?? "#0074D9",
    },
  });

  if (options.animatingIcon) {
    map.addLayer({
      id: routePointLayerId,
      type: "symbol",
      source: {
        type: "geojson",
        data: point,
      },
      paint: {
        "icon-opacity": options.animatingIcon?.["icon-opacity"] ?? 1.0,
        "text-color": options.animatingIcon?.["text-color"] ?? "#000000",
      },
      layout: {
        "icon-allow-overlap":
          options.animatingIcon?.["icon-allow-overlap"] ?? true,
        "icon-image": options.animatingIcon?.["icon-image"] ?? "marker-15",
        "icon-size": options.animatingIcon?.["icon-size"] ?? 1.0,
        "icon-anchor": options.animatingIcon?.["icon-anchor"] ?? "center",
        "icon-offset": options.animatingIcon?.["icon-offset"] ?? [0, 0],
        "icon-rotate": options.animatingIcon?.["icon-rotate"] ?? 0,
        "text-font": options.animatingIcon?.["text-font"] ?? ["Open Sans Bold"],
        "text-size": options.animatingIcon?.["text-size"] ?? 12,
        "text-field": options.animatingIcon?.["text-field"] ?? "",
      },
    });
  } else {
    map.addLayer({
      id: routePointLayerId,
      type: "circle",
      source: {
        type: "geojson",
        data: point,
      },
      paint: {
        "circle-color": options.animatingPoint?.["circle-color"] ?? "#B42222",
        "circle-radius": options.animatingPoint?.["circle-radius"] ?? 7,
        "circle-opacity": options.animatingPoint?.["circle-opacity"] ?? 1.0,
        "circle-stroke-width":
          options.animatingPoint?.["circle-stroke-width"] ?? 2,
        "circle-stroke-color":
          options.animatingPoint?.["circle-stroke-color"] ?? "#B42222",
      },
    });
  }

  // Add popups to the droped points if specified
  if (options.visitedPoints?.popupColumn) {
    addLayerPopup(
      map,
      routeVisitedPointsLayerId,
      options.visitedPoints.popupColumn
    );
  }

  if (showTimelineControls) {
    // Get date range from the route points if available
    const startDate = points.features[0]?.properties?.date || "2023-01-01";
    const endDate =
      points.features[points.features.length - 1]?.properties?.date ||
      "2023-12-31";

    // Add timeline controls
    addTimelineControl(
      widgetInstance,
      startDate,
      endDate,
      function (playing) {
        if (playing) {
          // Start animation
          animateRoute(widgetInstance, routeOptions);
        } else {
          // Pause animation
          pauseAnimation(widgetInstance, routeOptions);
        }
      },
      function (progress) {
        // Handle slider change - jump to specific point in animation
        const route = widgetInstance.getAnimations()[routeId];
        if (route && !route.isAnimating) {
          // Calculate the target step based on progress
          const targetStep = Math.floor(
            progress * (route.linePoints.length - 1)
          );
          route.counter = targetStep;

          // Update the animated point position
          route.point.features[0].geometry.coordinates =
            route.linePoints[targetStep].geometry.coordinates;
          route.map.getSource(route.routePointLayerId).setData(route.point);

          // Update visited points if dropping them
          if (route.dropVisited) {
            route.visitedPoints.features = [];

            // Add all visited points up to current position
            for (let i = 0; i <= targetStep; i++) {
              const currentCoord = route.linePoints[i].geometry.coordinates;
              const coordIndex = route.coords.findIndex(
                (coord) =>
                  coord[0] === currentCoord[0] && coord[1] === currentCoord[1]
              );

              if (coordIndex !== -1) {
                route.visitedPoints.features.push({
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: currentCoord,
                  },
                  properties:
                    route.points.features[coordIndex]?.properties ?? {},
                });
              }
            }
            route.map
              .getSource(route.visitedLayerId)
              .setData(route.visitedPoints);
          }
        }
      },
      options.timelineControlOptions || {}
    );
  }
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
  const routeId = routeOptions.routeId || "route";

  const route = widgetInstance.getAnimations()[routeId];
  if (!route) {
    console.error("No route found to animate for routeId:", routeId);
    return;
  }

  function animate() {
    const state = widgetInstance.getAnimations()[routeId];
    if (!state?.isAnimating || state.counter >= state.linePoints.length) {
      // Animation finished
      if (state?.isAnimating && state.map._timelineControl) {
        state.map._timelineControl.setPlaying(false);
        state.isAnimating = false;
      }
      return;
    }

    // Move the animated point
    state.point.features[0].geometry.coordinates =
      state.linePoints[state.counter].geometry.coordinates;
    state.map.getSource(state.routePointLayerId).setData(state.point);

    if (route.dropVisited) {
      const currentCoord = state.linePoints[state.counter].geometry.coordinates;
      // Check if currentCoord matches any original coord
      if (
        state.coords.some(
          (coord) =>
            coord[0] === currentCoord[0] && coord[1] === currentCoord[1]
        )
      ) {
        const idx = state.coords.findIndex(
          (coord) =>
            coord[0] === currentCoord[0] && coord[1] === currentCoord[1]
        );
        state.visitedPoints.features.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: currentCoord,
          },
          properties: state.points.features[idx]?.properties ?? {},
        });
        state.map.getSource(state.visitedLayerId).setData(state.visitedPoints);
      }
    }

    // Update timeline slider progress
    if (state.map._timelineControl && state.showTimelineControls) {
      const progress = state.counter / (state.linePoints.length - 1);
      state.map._timelineControl.setProgress(progress);
    }

    state.counter += 1;
    state.animationFrameId = requestAnimationFrame(animate);
  }

  widgetInstance.getAnimations()[routeId].isAnimating = true;

  animate();
}

/**
 * Pause the route animation on the map.
 *
 * @param {object} widgetInstance The map widget instance.
 * @param {object} routeOptions   Options for the route to pause.
 * @return {void}
 */
function pauseAnimation(widgetInstance, routeOptions) {
  const routeId = routeOptions.routeId || "route";

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
  const routeId = routeOptions.routeId || "route";

  const route = widgetInstance.getAnimations()[routeId];
  if (!route) {
    console.error("No route found to animate for routeId:", routeId);
    return;
  }
  const map = widgetInstance.getMap();
  const routeLineLayerId = route.routeLineLayerId;
  const routePointLayerId = route.routePointLayerId;
  const routeVisitedPointsLayerId = route.visitedLayerId;
  // Remove layers if they exist
  [routeLineLayerId, routePointLayerId, routeVisitedPointsLayerId].forEach(
    (layerId) => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
    }
  );

  // Remove sources if they exist
  [routeLineLayerId, routePointLayerId, routeVisitedPointsLayerId].forEach(
    (sourceId) => {
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    }
  );

  if (route.showTimelineControls && map._timelineControl) {
    removeControl(widgetInstance, "toro_timeline_control");
  }

  // Remove animation state
  if (widgetInstance.getAnimations()[routeId]) {
    delete widgetInstance.getAnimations()[routeId];
  }
}
