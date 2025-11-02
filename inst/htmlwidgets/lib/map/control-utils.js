/**
 * @file control-utils.js
 *
 * Utility functions for managing map controls in Maplibre GL JS.
 *
 * Current controls include:
 * - Draw control
 *
 * Functions:
 * - addDrawControl: Adds a draw control to the map instance.
 * - deleteDrawnShape: Deletes a drawn shape from the map.
 * - hideDrawControls: Hides the draw controls on the map.
 * - showDrawControls: Shows the draw controls on the map.
 * - _getDrawnStyle: Returns the style configuration for drawn shapes.
 * - addCursorCoordinateControl: Adds a control to display cursor coordinates on the map.
 * - addCustomControl: Adds a custom control to the map with specified HTML content.
 * - addZoomControl: Adds a zoom control to the map.
 *
 * @note Draw controls are based on Mapbox GL Draw, which is compatible with Maplibre GL JS.
 *       For more information: `https://github.com/mapbox/mapbox-gl-draw/blob/main/docs/API.md`.
 */

const validDrawModes = ["polygon", "trash", "line", "point"]; // Accepted draw modes

/**
 * Add a draw control to the map instance.
 *
 * For the `MapboxDraw` documentation, see:
 *    `https://github.com/mapbox/mapbox-gl-draw/blob/main/docs/API.md`.
 *
 * @note Draw mode `trash` currently does nothing as the shapes are all set to
 *       static after being made.
 *
 * @param {object} el             Widget element containing the map instance.
 * @param {string} position       Position of the control on the map (e.g., "top-right", "bottom-left").
 * @param {string[]} modes        Draw modes to enable in the control.
 * @param {string} activeColour   Colour for the shape currently being drawn.
 * @param {string} inactiveColour Colour for shapes that are not currently being drawn.
 * @param {object} modeLabels     A named list of labels for each mode.
 *                                For example, `{ polygon: "Draw Polygon", trash: "Delete Shape" }
 * @returns {void}
 */
function addDrawControl(
  el,
  position,
  modes,
  activeColour,
  inactiveColour,
  modeLabels
) {
  modes = modes.flat ? modes.flat() : [].concat(...modes);
  modes = modes.filter((mode) => validDrawModes.includes(mode));

  /**
   * Create a custom mode to prevent shapes from being edited by
   * clicking on them.
   */
  var StaticMode = {};

  StaticMode.onSetup = function () {
    this.setActionableState(); // default actionable state is false for all actions
    return {};
  };

  StaticMode.toDisplayFeatures = function (state, geojson, display) {
    display(geojson);
  };

  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: modes.includes("polygon"),
      trash: modes.includes("trash"),
      line_string: modes.includes("line"),
      point: modes.includes("point"),
    },
    styles: _getDrawnStyle(activeColour, inactiveColour),
    modes: Object.assign(
      {
        static: StaticMode,
      },
      MapboxDraw.modes
    ),
  });
  el.draw = draw; // Store the draw instance in the element
  el.mapInstance.addControl(draw, position);
  // Set the buttons to be clickable
  modes.forEach((mode) => {
    setTimeout(function () {
      var controlBtn = el.querySelector(".mapbox-gl-draw_" + mode);

      if (controlBtn) {
        controlBtn.style.pointerEvents = "auto";

        var label = modeLabels[mode];
        if (label) {
          controlBtn.classList.add("draw-control-custom-label");
          controlBtn.innerHTML = label; // Set the button label if provided
          controlBtn.style.backgroundImage = "none"; // Remove default background image
        }
      }
    }, 0);
  });

  if (HTMLWidgets.shinyMode) {
    // Trigger Shiny input when a feature is created
    el.mapInstance.on("draw.create", function (e) {
      const feature = e.features[0]; // The drawn feature
      const geojson = JSON.stringify(feature);
      Shiny.setInputValue(el.id + "_shape_created", geojson, {
        priority: "event",
      });
      /**
       * Change mode to static after a short delay to avoid recursion.
       * Stops shapes from being editable after creation.
       */
      setTimeout(function () {
        if (el.draw.getMode && el.draw.getMode() !== "static") {
          el.draw.changeMode("static");
        }
      }, 50);
    });

    // Trigger Shiny input when a feature is deleted
    el.mapInstance.on("draw.delete", function (e) {
      Shiny.setInputValue(el.id + "_shape_deleted", e.features.id, {
        priority: "event",
      });
    });
  }
}

/**
 * Delete a drawn shape from the map.
 *
 * @param {object} el Map widget element containing the map instance.
 * @param {string} shapeId ID of the shape to delete.
 * @returns {void}
 */
function deleteDrawnShape(el, shapeId) {
  el.draw.delete(shapeId); // Use the MapboxDraw instance to delete the shape
}

/**
 * Hide the draw controls on the map.
 *
 * @param {object} el Widget element containing the map instance.
 * @returns {void}
 */
function hideDrawControls(el) {
  validDrawModes.forEach((mode) => {
    var controlBtn = el.querySelector(".mapbox-gl-draw_" + mode);

    if (controlBtn) {
      controlBtn.style.display = "none";
      controlBtn.style.pointerEvents = "none";
    }
  });
}

/**
 * Show the draw controls on the map.
 *
 * @param {object} el Widget element containing the map instance.
 * @returns {void}
 */
function showDrawControls(el) {
  validDrawModes.forEach((mode) => {
    var controlBtn = el.querySelector(".mapbox-gl-draw_" + mode);

    if (controlBtn) {
      controlBtn.style.display = "inline-block";
      controlBtn.style.pointerEvents = "auto";
    }
  });
}

/**
 * Get the style configuration for drawn shapes.
 *
 * @param {string} activeColour   Hex colour for the active shape.
 * @param {string} inactiveColour Hex colour for inactive shapes.
 * @returns {void}
 */
function _getDrawnStyle(activeColour, inactiveColour) {
  return [
    {
      id: "gl-draw-polygon-fill-inactive",
      type: "fill",
      filter: [
        "all",
        ["==", "active", "false"],
        ["==", "$type", "Polygon"],
        ["!=", "mode", "static"],
      ],
      paint: {
        "fill-color": inactiveColour,
        "fill-outline-color": inactiveColour,
        "fill-opacity": 0.1,
      },
    },
    {
      id: "gl-draw-polygon-fill-active",
      type: "fill",
      filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
      paint: {
        "fill-color": activeColour,
        "fill-outline-color": activeColour,
        "fill-opacity": 0.1,
      },
    },
    {
      id: "gl-draw-polygon-midpoint",
      type: "circle",
      filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
      paint: {
        "circle-radius": 3,
        "circle-color": activeColour,
      },
    },
    {
      id: "gl-draw-polygon-stroke-inactive",
      type: "line",
      filter: [
        "all",
        ["==", "active", "false"],
        ["==", "$type", "Polygon"],
        ["!=", "mode", "static"],
      ],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": inactiveColour,
        "line-width": 2,
      },
    },
    {
      id: "gl-draw-polygon-stroke-active",
      type: "line",
      filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": activeColour,
        "line-dasharray": [0.2, 2],
        "line-width": 2,
      },
    },
    {
      id: "gl-draw-line-inactive",
      type: "line",
      filter: [
        "all",
        ["==", "active", "false"],
        ["==", "$type", "LineString"],
        ["!=", "mode", "static"],
      ],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": inactiveColour,
        "line-width": 2,
      },
    },
    {
      id: "gl-draw-line-active",
      type: "line",
      filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": activeColour,
        "line-dasharray": [0.2, 2],
        "line-width": 2,
      },
    },
    {
      id: "gl-draw-polygon-and-line-vertex-stroke-inactive",
      type: "circle",
      filter: [
        "all",
        ["==", "meta", "vertex"],
        ["==", "$type", "Point"],
        ["!=", "mode", "static"],
      ],
      paint: {
        "circle-radius": 5,
        "circle-color": "#fff",
      },
    },
    {
      id: "gl-draw-polygon-and-line-vertex-inactive",
      type: "circle",
      filter: [
        "all",
        ["==", "meta", "vertex"],
        ["==", "$type", "Point"],
        ["!=", "mode", "static"],
      ],
      paint: {
        "circle-radius": 3,
        "circle-color": activeColour,
      },
    },
    {
      id: "gl-draw-point-point-stroke-inactive",
      type: "circle",
      filter: [
        "all",
        ["==", "active", "false"],
        ["==", "$type", "Point"],
        ["==", "meta", "feature"],
        ["!=", "mode", "static"],
      ],
      paint: {
        "circle-radius": 5,
        "circle-opacity": 1,
        "circle-color": "#fff",
      },
    },
    {
      id: "gl-draw-point-inactive",
      type: "circle",
      filter: [
        "all",
        ["==", "active", "false"],
        ["==", "$type", "Point"],
        ["==", "meta", "feature"],
        ["!=", "mode", "static"],
      ],
      paint: {
        "circle-radius": 3,
        "circle-color": inactiveColour,
      },
    },
    {
      id: "gl-draw-point-stroke-active",
      type: "circle",
      filter: [
        "all",
        ["==", "$type", "Point"],
        ["==", "active", "true"],
        ["!=", "meta", "midpoint"],
      ],
      paint: {
        "circle-radius": 7,
        "circle-color": "#fff",
      },
    },
    {
      id: "gl-draw-point-active",
      type: "circle",
      filter: [
        "all",
        ["==", "$type", "Point"],
        ["!=", "meta", "midpoint"],
        ["==", "active", "true"],
      ],
      paint: {
        "circle-radius": 5,
        "circle-color": activeColour,
      },
    },
    {
      id: "gl-draw-polygon-fill-static",
      type: "fill",
      filter: ["all", ["==", "mode", "static"], ["==", "$type", "Polygon"]],
      paint: {
        "fill-color": inactiveColour,
        "fill-outline-color": inactiveColour,
        "fill-opacity": 0.1,
      },
    },
    {
      id: "gl-draw-polygon-stroke-static",
      type: "line",
      filter: ["all", ["==", "mode", "static"], ["==", "$type", "Polygon"]],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": inactiveColour,
        "line-width": 2,
      },
    },
    {
      id: "gl-draw-line-static",
      type: "line",
      filter: ["all", ["==", "mode", "static"], ["==", "$type", "LineString"]],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": inactiveColour,
        "line-width": 2,
      },
    },
    {
      id: "gl-draw-point-static",
      type: "circle",
      filter: ["all", ["==", "mode", "static"], ["==", "$type", "Point"]],
      paint: {
        "circle-radius": 5,
        "circle-color": inactiveColour,
      },
    },
  ];
}

/**
 * Add a control to display cursor coordinates on the map.
 *
 * @param {object} map        Maplibre map instance.
 * @param {string} position   What position to place the control in the map.
 * @param {string} longLabel  Label for the longitude coordinate.
 * @param {string} latLabel   Label for the latitude coordinate.
 * @returns {void}
 */
function addCursorCoordinateControl(map, position, longLabel, latLabel) {
  class CursorCoordsControl {
    onAdd(map) {
      this._container = document.createElement("div");
      this._container.className = "toro-ctrl cursor-coords-control";
      this._container.id = "cursor_coords";
      this._container.innerHTML = "<p id='map-cursor-coords'></p>";
      return this._container;
    }
    onRemove() {
      this._container.parentNode.removeChild(this._container);
    }
  }
  map.addControl(new CursorCoordsControl(), position);
  const coordDiv = document.getElementById("map-cursor-coords");
  if (!coordDiv) {
    console.warn("Cursor coordinate control element not found.");
    return;
  }
  map.on("mousemove", (e) => {
    const lng = e.lngLat.lng.toFixed(3);
    const lat = e.lngLat.lat.toFixed(3);
    coordDiv.textContent = `${longLabel}: ${lng}, ${latLabel}: ${lat}`;
  });
}

/**
 * Add a custom control to the map with specified HTML content.
 *
 * @param {object} map        Maplibre map instance.
 * @param {string} controlId  ID for the custom control.
 * @param {string} html       HTML content for the custom control.
 * @param {string} position   Position to place the control in the map.
 *                            Default is "top-right".
 * @returns {void}
 */
function addCustomControl(map, controlId, html, position = "top-right") {
  class CustomControl {
    onAdd(mapInstance) {
      this._container = document.createElement("div");
      this._container.id = controlId;
      this._container.className = "toro-ctrl custom-control";
      this._container.innerHTML = html;
      return this._container;
    }
    onRemove() {
      this._container.parentNode.removeChild(this._container);
    }
  }
  map.addControl(new CustomControl(), position);
}

/**
 * Toggle visibility of a control element on the map.
 *
 * Controls can be identified as follows:
 * - `zoom_control`: Zoom control (including compass).
 * - `draw_control`: Draw control.
 * - `cursor_coords`: Cursor coordinates control.
 * -  Other controls can be identified by their ID created in `add_custom_control`.
 *
 * @param {object} el          Widget element containing the map instance.
 * @param {string} controlId   ID of the control to toggle.
 * @param {boolean} show       Whether to show or hide the control.
 * @return {void}
 */
function toggleControl(el, controlId, show) {
  var control;

  if (controlId == "zoom_control") {
    var buttons = el.querySelector(
      ".toro-ctrl-group .toro-ctrl-zoom-in, .toro-ctrl-group .toro-ctrl-zoom-out, .toro-ctrl-group .toro-ctrl-compass"
    );
    if (buttons) {
      control = buttons.parentElement;
    }
  } else if (controlId == "draw_control") {
    var buttons = el.querySelector(".mapbox-gl-draw_ctrl-draw-btn");
    if (buttons) {
      control = buttons.parentElement;
    }
  } else {
    control = el.querySelector("#" + controlId);
  }
  if (!control) {
    console.warn(`Control with ID ${controlId} not found.`);
    return;
  }
  control.style.display = show ? "block" : "none";
  control.style.pointerEvents = show ? "auto" : "none";
}

/**
 * Add a zoom control to the map.
 *
 * See [Maplibre NavigationControl docs](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/NavigationControlOptions/) for more.
 *
 * @param {object} map      Maplibre map instance.
 * @param {string} position Position to place the control in the map.
 *                          Default is "top-right".
 * @param {object} options  Options for the zoom control.
 *                          Can include:
 *                            - showZoom: boolean (default true)
 *                            - showCompass: boolean (default false)
 *                            - visualizePitch: boolean (default false)
 *                            - visualizeRoll: boolean (default false)
 * @return {void}
 */
function addZoomControl(map, position, options) {
  if (Array.isArray(options) || options.length === 0) {
    options = {};
  }

  // Set defaults
  if (options.showZoom === undefined) {
    options.showZoom = true;
  }
  if (options.showCompass === undefined) {
    options.showCompass = false;
  }
  if (options.visualizePitch === undefined) {
    options.visualizePitch = false;
  }
  if (options.visualizeRoll === undefined) {
    options.visualizeRoll = false;
  }
  let nav = new maplibregl.NavigationControl(options);
  map.addControl(nav, position);
}

/**
 * Remove a control from the map.
 *
 * @param {object} widgetInstance Toro widget object.
 * @param {string} controlId      ID of the control to remove.
 * @returns {void}
 */
function removeControl(widgetInstance, controlId) {
  const map = widgetInstance.getMap();
  if (!map) return;
  const controlElement = document.getElementById(controlId);
  if (controlElement) {
    controlElement.remove();
  }
}

/**
 * Add a timeline control to the map for animating data over time.
 *
 * @param {object} widgetInstance   Toro widget object.
 * @param {string} startDate        Start date for timeline.
 * @param {string} endDate          End date for timeline.
 * @param {function} onPlayPause    Callback for play/pause button.
 * @param {function} onSliderChange Callback for slider change.
 * @param {object} options          Options for the timeline control.
 *                                  Can include:
 *                                    - position: string (default "bottom-left")
 *                                    - maxTicks: number (default 3) - Maximum number of labeled ticks
 * @return {void}
 */
function addTimelineControl(
  widgetInstance,
  startDate,
  endDate,
  onPlayPause,
  onSliderChange,
  options = {}
) {
  const map = widgetInstance.getMap();
  // Format dates as needed
  const start = new Date(startDate).toLocaleDateString();
  const end = new Date(endDate).toLocaleDateString();

  // Calculate date range and ticks
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const totalDays = Math.ceil(
    (endDateObj - startDateObj) / (1000 * 60 * 60 * 24)
  );

  // Generate axis ticks with dynamic spacing to prevent overlap
  let axisHTML = "";
  const maxTicks = options.maxTicks || 3; // Maximum number of labeled ticks to prevent overlap

  // Calculate smart tick positions using maxTicks
  const majorTickPositions = [];

  if (maxTicks <= 1) {
    // Show only start
    majorTickPositions.push(0);
  } else if (maxTicks === 2) {
    // Show start and end
    majorTickPositions.push(0, totalDays);
  } else {
    // For 3+ ticks, distribute evenly across the range
    majorTickPositions.push(0); // Always include start

    // Add intermediate ticks based on maxTicks
    const intermediateCount = maxTicks - 2; // Subtract start and end
    for (let i = 1; i <= intermediateCount; i++) {
      const position = Math.floor((totalDays * i) / (intermediateCount + 1));
      majorTickPositions.push(position);
    }

    majorTickPositions.push(totalDays); // Always include end
  }

  // Remove duplicates and sort
  const uniquePositions = [...new Set(majorTickPositions)].sort(
    (a, b) => a - b
  );

  // Create major ticks (with labels)
  uniquePositions.forEach((dayIndex) => {
    const tickDate = new Date(
      startDateObj.getTime() + dayIndex * 24 * 60 * 60 * 1000
    );
    const position = (dayIndex / totalDays) * 100;

    const shortDate = tickDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: totalDays > 365 ? "numeric" : undefined,
    });

    axisHTML += `
      <div class="timeline-tick major-tick" style="left: ${position}%;">
        <div class="timeline-tick-line"></div>
        <div class="timeline-tick-label">${shortDate}</div>
      </div>
    `;
  });

  // Create minor ticks between major ticks
  const minorTickInterval = Math.max(1, Math.floor(totalDays / 12)); // More minor ticks
  for (let i = minorTickInterval; i < totalDays; i += minorTickInterval) {
    // Skip if this position is already a major tick
    if (!uniquePositions.includes(i)) {
      const position = (i / totalDays) * 100;
      axisHTML += `
        <div class="timeline-tick minor-tick" style="left: ${position}%;">
          <div class="timeline-tick-line"></div>
        </div>
      `;
    }
  }

  // HTML for the control
  const html = `
    <div class="timeline-control-container">
      <button id="timeline-play-pause" class="timeline-play-btn">▶</button>
      <div class="timeline-axis-container">
        <!-- Current date display above slider - always visible -->
        <div id="timeline-current-date">${start}</div>
        <!-- Slider with custom styling -->
        <div class="timeline-slider-container">
          <input type="range" id="timeline-slider" min="0" max="100" value="0" />
          
          <!-- Date ticks -->
          ${axisHTML}
        </div>
      </div>
    </div>
    <style>
      
    </style>
  `;

  // Add the control to the map
  addCustomControl(
    map,
    "toro_timeline_control",
    html,
    options.position || "bottom-left"
  );

  // Ensure the control is clickable by setting pointer events
  setTimeout(() => {
    const timelineControl = document.getElementById("toro_timeline_control");
    if (timelineControl) {
      timelineControl.style.pointerEvents = "auto";
      timelineControl.style.zIndex = "1000";

      // Set pointer events on all child elements
      const allElements = timelineControl.querySelectorAll("*");
      allElements.forEach((el) => {
        if (
          el.tagName === "SPAN" &&
          el.classList.contains("timeline-date-label")
        ) {
          el.style.pointerEvents = "none";
        } else {
          el.style.pointerEvents = "auto";
        }
      });
    }
  }, 100);

  // Get control elements with retry mechanism
  let playPauseBtn, timelineSlider;
  let playing = false;
  let lastClickTime = 0;
  let updateSliderAppearance;

  function setupEventHandlers() {
    playPauseBtn = document.getElementById("timeline-play-pause");
    timelineSlider = document.getElementById("timeline-slider");

    if (!playPauseBtn || !timelineSlider) {
      console.warn("Timeline control elements not found, retrying...");
      setTimeout(setupEventHandlers, 50);
      return;
    }

    // Function to update current date display and slider appearance
    updateSliderAppearance = function () {
      const progress = parseFloat(timelineSlider.value) / 100;
      const currentDate = new Date(
        startDateObj.getTime() +
          progress * (endDateObj.getTime() - startDateObj.getTime())
      );
      const currentDateDisplay = document.getElementById(
        "timeline-current-date"
      );

      if (currentDateDisplay) {
        // Update date text
        const formattedDate = currentDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        currentDateDisplay.textContent = formattedDate;

        // Position the date display above the thumb
        currentDateDisplay.style.left = `${progress * 100}%`;

        // Update slider background to show progress
        const progressColor = playing ? "var(--toro-timeline-right)" : "var(--toro-timeline-left)";
        timelineSlider.style.background = `linear-gradient(to right, ${progressColor} 0%, ${progressColor} ${
          progress * 100
        }%, #ddd ${progress * 100}%, #ddd 100%)`;
      }
    };

    // Add play/pause logic with debounce
    const handlePlayPause = function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Debounce rapid clicks (ignore clicks within 200ms)
      const now = Date.now();
      if (now - lastClickTime < 200) {
        console.log("Ignoring rapid click");
        return;
      }
      lastClickTime = now;

      // If clicking play and slider is at the end (or very close to end), reset to beginning
      if (!playing && parseFloat(timelineSlider.value) >= 95) {
        timelineSlider.value = 0;
        updateSliderAppearance();

        // Trigger the slider change callback to reset animation position
        if (typeof onSliderChange === "function") {
          onSliderChange(0);
        }
      }

      playing = !playing;
      playPauseBtn.innerHTML = playing ? "⏸" : "▶";

      // Disable/enable slider based on play state
      timelineSlider.disabled = playing;
      timelineSlider.style.opacity = playing ? "0.5" : "1";
      timelineSlider.style.cursor = playing ? "not-allowed" : "pointer";

      if (typeof onPlayPause === "function") {
        onPlayPause(playing);
      }
    };

    // Use only addEventListener to avoid double event firing
    playPauseBtn.addEventListener("click", handlePlayPause);
    playPauseBtn.addEventListener("mousedown", function (e) {
      e.stopPropagation();
    });

    // Add slider change logic
    const handleSliderChange = function (e) {
      e.stopPropagation();
      updateSliderAppearance();

      if (!playing && typeof onSliderChange === "function") {
        const progress = parseFloat(this.value) / 100;
        onSliderChange(progress);
      }
    };

    // Use only addEventListener to avoid duplicate events
    timelineSlider.addEventListener("input", handleSliderChange);
    timelineSlider.addEventListener("mousedown", function (e) {
      e.stopPropagation();
    });

    // Initial update
    setTimeout(updateSliderAppearance, 150);
  }

  setupEventHandlers();

  // Store references for external access
  map._timelineControl = {
    playPauseBtn: playPauseBtn,
    slider: timelineSlider,
    updateAppearance: updateSliderAppearance,
    setProgress: function (progress) {
      // Update slider position (0-1 range to 0-100)
      if (timelineSlider) {
        timelineSlider.value = Math.round(progress * 100);
        updateSliderAppearance();
      }
    },
    setPlaying: function (isPlaying) {
      playing = isPlaying;
      if (playPauseBtn) {
        playPauseBtn.innerHTML = playing ? "⏸" : "▶";
      }
      if (timelineSlider) {
        timelineSlider.disabled = playing;
        timelineSlider.style.opacity = playing ? "0.5" : "1";
        timelineSlider.style.cursor = playing ? "not-allowed" : "pointer";
        updateSliderAppearance();
      }
    },
  };
}
