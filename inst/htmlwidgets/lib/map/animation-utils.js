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

  // Get or initialize animations object
  let animations = widgetInstance.getAnimations();
  if (!animations) {
    console.warn(
      "Animations object not initialized, this might indicate a setup issue"
    );
    return;
  }

  const showTimelineControls =
    options.showTimelineControls ||
    (false && "date" in points.features[0].properties);

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
      data: animations[routeId].visitedPoints,
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

  // Create control panel if needed
  const useControlPanel = options.useAnimationControlPanel || false;
  if (useControlPanel) {
    const panelOptions = options.animationControlPanelOptions || {};
    const panelId = panelOptions.panelId || "animation-controls";

    // Only create if it doesn't already exist
    if (!map._controlPanels || !map._controlPanels[panelId]) {
      addControlPanel(widgetInstance, panelId, {
        title: panelOptions.title || "Animation Controls",
        position: panelOptions.position || "bottom-left",
        collapsible: panelOptions.collapsible !== false,
        collapsed: panelOptions.collapsed || false,
        showTitle: panelOptions.showTitle !== false,
      });
    }
  }

  // Check for existing timeline controls in panels and connect them to animation
  const existingTimelineControl = checkForExistingTimelineControl(map);
  const existingSpeedControl = checkForExistingSpeedControl(map);

  if (showTimelineControls || existingTimelineControl) {
    // If we found an existing timeline control, make sure the animation knows to update it
    if (existingTimelineControl) {
      animations[routeId].showTimelineControls = true;
    }

    // Get date range from the route points if available
    const startDate = points.features[0]?.properties?.date || "2023-01-01";
    const endDate =
      points.features[points.features.length - 1]?.properties?.date ||
      "2023-12-31";

    // Define animation callbacks
    const playPauseCallback = function (playing) {
      if (playing) {
        // Start animation
        animateRoute(widgetInstance, routeOptions);
      } else {
        // Pause animation
        pauseAnimation(widgetInstance, routeOptions);
      }
    };

    const sliderCallback = function (progress) {
      // Handle slider change - jump to specific point in animation
      const route = widgetInstance.getAnimations()[routeId];
      if (route && !route.isAnimating) {
        // Calculate the target step based on progress
        const targetStep = Math.floor(progress * (route.linePoints.length - 1));
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
                properties: route.points.features[coordIndex]?.properties ?? {},
              });
            }
          }
          route.map
            .getSource(route.visitedLayerId)
            .setData(route.visitedPoints);
        }
      }
    };

    if (existingTimelineControl) {
      // Connect existing timeline control to animation
      connectTimelineControlToAnimation(
        map,
        existingTimelineControl,
        playPauseCallback,
        sliderCallback,
        startDate,
        endDate
      );
    } else {
      // Add new timeline controls
      addTimelineControl(
        widgetInstance,
        startDate,
        endDate,
        playPauseCallback,
        sliderCallback,
        options.timelineControlOptions || {}
      );
    }
  }

  if (showSpeedControl || existingSpeedControl) {
    // Define speed change callback
    const speedChangeCallback = function (speed) {
      // Update animation speed
      const route = widgetInstance.getAnimations()[routeId];
      if (route) {
        route.animationSpeed = speed;
      }
    };

    if (existingSpeedControl) {
      // Connect existing speed control to animation
      connectSpeedControlToAnimation(
        map,
        existingSpeedControl,
        speedChangeCallback
      );
    } else {
      // Add new speed control
      addSpeedControl(
        widgetInstance,
        speedChangeCallback,
        options.speedControlOptions || {}
      );
    }
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
      const timelineSlider = document.getElementById("timeline-slider");
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
    route.point.features[0].geometry.coordinates =
      route.linePoints[route.counter].geometry.coordinates;
    route.map.getSource(route.routePointLayerId).setData(route.point);
  }

  // Ensure starting visited point is added when animation begins (especially for counter = 0)
  if (route.dropVisited && route.counter === 0 && route.coords.length > 0) {
    const startCoord = route.coords[0];
    const startPointExists = route.visitedPoints.features.some(
      (feature) =>
        feature.geometry.coordinates[0] === startCoord[0] &&
        feature.geometry.coordinates[1] === startCoord[1]
    );

    if (!startPointExists) {
      route.visitedPoints.features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: startCoord,
        },
        properties: route.points.features[0]?.properties ?? {},
      });
      route.map.getSource(route.visitedLayerId).setData(route.visitedPoints);
    }
  }

  const startProgress = Math.round(
    (route.counter / (route.linePoints.length - 1)) * 100
  );

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
        state.point.features[0].geometry.coordinates =
          state.linePoints[state.linePoints.length - 1].geometry.coordinates;
        state.map.getSource(state.routePointLayerId).setData(state.point);
      }

      // Ensure the final visited point is added when animation completes
      if (route.dropVisited && state.coords.length > 0) {
        const finalCoord = state.coords[state.coords.length - 1];
        const finalPointExists = state.visitedPoints.features.some(
          (feature) =>
            feature.geometry.coordinates[0] === finalCoord[0] &&
            feature.geometry.coordinates[1] === finalCoord[1]
        );

        if (!finalPointExists) {
          state.visitedPoints.features.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: finalCoord,
            },
            properties:
              state.points.features[state.points.features.length - 1]
                ?.properties ?? {},
          });
          state.map
            .getSource(state.visitedLayerId)
            .setData(state.visitedPoints);
        }
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
      state.counter = Math.min(
        state.counter + integerSteps,
        state.linePoints.length - 1
      );
      state.lastFrameTime = currentTime;

      // Move the animated point
      state.point.features[0].geometry.coordinates =
        state.linePoints[state.counter].geometry.coordinates;
      state.map.getSource(state.routePointLayerId).setData(state.point);

      if (route.dropVisited) {
        // Check all positions between oldCounter and current counter for original coordinates
        // This ensures we don't miss any original points when animating at high speeds
        for (let i = oldCounter; i <= state.counter; i++) {
          const currentCoord = state.linePoints[i].geometry.coordinates;

          // Check if currentCoord matches any original coord
          const coordIndex = state.coords.findIndex(
            (coord) =>
              coord[0] === currentCoord[0] && coord[1] === currentCoord[1]
          );

          if (coordIndex !== -1) {
            // Check if this point is already in visitedPoints to avoid duplicates
            const pointExists = state.visitedPoints.features.some(
              (feature) =>
                feature.geometry.coordinates[0] === currentCoord[0] &&
                feature.geometry.coordinates[1] === currentCoord[1]
            );

            if (!pointExists) {
              state.visitedPoints.features.push({
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: currentCoord,
                },
                properties: state.points.features[coordIndex]?.properties ?? {},
              });
              // Update the source after adding the point
              state.map
                .getSource(state.visitedLayerId)
                .setData(state.visitedPoints);
            }
          }
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

  if (route.showSpeedControl && map._speedControl) {
    removeControl(widgetInstance, "toro_speed_control");
  }

  // Remove animation state
  if (widgetInstance.getAnimations()[routeId]) {
    delete widgetInstance.getAnimations()[routeId];
  }
}

/**
 * Check for existing timeline control in control panels
 *
 * @param {object} map The map instance
 * @returns {object|null} Timeline control element or null if not found
 */
function checkForExistingTimelineControl(map) {
  const timelineSlider = document.getElementById("timeline-slider");
  const playPauseBtn = document.getElementById("timeline-play-pause");

  if (timelineSlider && playPauseBtn) {
    return { slider: timelineSlider, playPauseBtn: playPauseBtn };
  }
  return null;
}

/**
 * Check for existing speed control in control panels
 *
 * @param {object} map The map instance
 * @returns {object|null} Speed control element or null if not found
 */
function checkForExistingSpeedControl(map) {
  const speedSlider = document.getElementById("speed-slider");

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
      slider.style.opacity = "1";
      slider.style.cursor = "pointer";
    }

    if (playPauseBtn.disabled) {
      playPauseBtn.disabled = false;
      playPauseBtn.style.opacity = "1";
      playPauseBtn.style.cursor = "pointer";
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
          playPauseBtn.innerHTML = playing ? "⏸" : "▶";
        }
        if (slider) {
          slider.disabled = playing;
          slider.style.opacity = playing ? "0.5" : "1";
          slider.style.cursor = playing ? "not-allowed" : "pointer";
        }
      }
    };
  }

  // Note: Play/pause event handling is managed by the timeline control's handlePlayPause function
  // which calls the playPauseCallback. No additional event listener needed here.

  slider.addEventListener("input", function (e) {
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
          playPauseBtn.innerHTML = playing ? "⏸" : "▶";
        }
        if (slider) {
          slider.disabled = playing;
          slider.style.opacity = playing ? "0.5" : "1";
          slider.style.cursor = playing ? "not-allowed" : "pointer";
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
function connectSpeedControlToAnimation(
  map,
  speedControl,
  speedChangeCallback
) {
  const { slider } = speedControl;

  // Enable the control if it was disabled using the proper enable method
  if (map._speedControl && typeof map._speedControl.enable === "function") {
    map._speedControl.enable(speedChangeCallback);
  } else {
    // Fallback: Enable the control manually if enable method not available
    if (slider.disabled) {
      slider.disabled = false;
      slider.style.opacity = "1";
      slider.style.cursor = "pointer";
    }
  }

  // Remove existing event listener to avoid duplicates
  const oldOnInput = slider.oninput;
  slider.oninput = null;

  // Add new event listener
  slider.addEventListener("input", function (e) {
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
          return Math.abs(current - speed) <
            Math.abs(speedValues[closest] - speed)
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
