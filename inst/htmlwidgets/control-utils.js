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
    onAdd(mapInstance) {
      this._container = document.createElement("div");
      this._container.className = "maplibregl-ctrl cursor-coords-control";
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
 * @param {object} map Maplibre map instance.
 * @param {string} html HTML content for the custom control.
 * @param {string} position Position to place the control in the map.
 *                          Default is "top-right".
 * @returns {void}
 */
function addCustomControl(map, html, position = "top-right") {
  class CustomControl {
    onAdd(mapInstance) {
      this._container = document.createElement("div");
      this._container.className = "maplibregl-ctrl custom-control";
      this._container.innerHTML = html;
      return this._container;
    }
    onRemove() {
      this._container.parentNode.removeChild(this._container);
    }
  }
  map.addControl(new CustomControl(), position);
}
