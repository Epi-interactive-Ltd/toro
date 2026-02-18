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
 * @param {string} controlId      Optional custom control ID. If not provided, uses default pattern.
 * @returns {void}
 */
function addDrawControl(
  el,
  position,
  modes,
  activeColour,
  inactiveColour,
  modeLabels,
  controlId = null
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

  // Generate namespaced ID for the draw control
  const mapId = el.widgetInstance ? el.widgetInstance.getId() : el.id;
  const drawControlId = controlId || `draw-control-${mapId}`;

  // Store the draw instance with proper references
  el.draw = draw;
  el.drawControlId = drawControlId;
  el.mapInstance.addControl(draw, position);

  // Add the ID to the draw control container after it's added to the DOM
  setTimeout(() => {
    const drawControls = el.querySelector(".mapboxgl-ctrl-group");
    if (
      drawControls &&
      drawControls.querySelector(".mapbox-gl-draw_ctrl-draw-btn")
    ) {
      drawControls.id = drawControlId;
    }
  }, 0);
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
 * @param {object} widgetInstance Optional widget instance for ID generation.
 * @returns {void}
 */
function addCursorCoordinateControl(
  map,
  position,
  longLabel,
  latLabel,
  widgetInstance = null
) {
  // Generate proper namespaced ID
  const controlId = widgetInstance
    ? `cursor-coords-${widgetInstance.getId()}`
    : "cursor_coords";
  const coordsDisplayId = widgetInstance
    ? `map-cursor-coords-${widgetInstance.getId()}`
    : "map-cursor-coords";

  class CursorCoordsControl {
    onAdd(map) {
      this._container = document.createElement("div");
      this._container.className = "toro-ctrl cursor-coords-control";
      this._container.id = controlId;
      this._container.innerHTML = `<p id='${coordsDisplayId}'></p>`;
      return this._container;
    }
    onRemove() {
      this._container.parentNode.removeChild(this._container);
    }
  }
  map.addControl(new CursorCoordsControl(), position);
  const coordDiv = document.getElementById(coordsDisplayId);
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
  } else if (
    controlId == "draw_control" ||
    controlId.startsWith("draw-control-")
  ) {
    // For backward compatibility, support both old "draw_control" and new namespaced IDs
    if (controlId.startsWith("draw-control-")) {
      control = el.querySelector("#" + controlId);
    } else {
      // Legacy support - look for any draw control
      var buttons = el.querySelector(".mapbox-gl-draw_ctrl-draw-btn");
      if (buttons) {
        control = buttons.parentElement;
      }
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
 * @param {object} widgetInstance Optional widget instance for ID generation
 * @return {void}
 */
function addZoomControl(map, position, options, widgetInstance = null) {
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

  // Store reference for removal and set ID if widget instance provided
  if (widgetInstance) {
    const controlId = `zoom-control-${widgetInstance.getId()}`;
    // Store the control reference on the map for later removal
    if (!map._toroControls) map._toroControls = {};
    map._toroControls[controlId] = nav;

    // Try to set an ID on the control element after it's added
    setTimeout(() => {
      const zoomControl = map
        .getContainer()
        .querySelector(".maplibregl-ctrl-group");
      if (
        zoomControl &&
        zoomControl.querySelector(".maplibregl-ctrl-zoom-in")
      ) {
        zoomControl.id = controlId;
      }
    }, 0);
  }
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
  const el = widgetInstance.getElement();
  if (!map) return;

  // Check if this is a draw control
  if (controlId.startsWith("draw-control-")) {
    // Remove the MapboxDraw instance from the map
    if (el.draw) {
      map.removeControl(el.draw);
      el.draw = null;
      el.drawControlId = null;
    }
    return;
  }

  // Check if this is a zoom control
  if (controlId.startsWith("zoom-control-")) {
    // Try to remove using stored reference first
    if (map._toroControls && map._toroControls[controlId]) {
      map.removeControl(map._toroControls[controlId]);
      delete map._toroControls[controlId];
      return;
    }

    // Fallback: remove by DOM element
    const controlElement = document.getElementById(controlId);
    if (controlElement) {
      controlElement.remove();
      return;
    }
  }

  // Handle other controls normally
  const controlElement = document.getElementById(controlId);
  if (controlElement) {
    controlElement.remove();
  }
}

/**
 * Remove a control from a control panel.
 *
 * @param {object} widgetInstance   Toro widget object.
 * @param {string} panelId          ID of the control panel.
 * @param {string} controlId        ID of the control to remove.
 * @return {void}
 */
function removeControlFromPanel(widgetInstance, panelId, controlId) {
  const map = widgetInstance.getMap();
  const panel = map._controlPanels && map._controlPanels[panelId];
  const el = widgetInstance.getElement();

  if (!panel) {
    console.warn(`Control panel with ID ${panelId} not found`);
    return;
  }

  // Special handling for draw controls
  if (controlId.startsWith("draw-control-")) {
    // Remove the MapboxDraw instance from the map first
    if (el.draw) {
      map.removeControl(el.draw);
      el.draw = null;
      el.drawControlId = null;
    }

    // Then remove the panel UI elements
    const panelDrawControl = el.querySelector(
      `#draw-control-panel-${widgetInstance.getId()}`
    );
    if (panelDrawControl) {
      const section = panelDrawControl.closest(".panel-control-item");
      if (section) {
        section.remove();
      } else {
        panelDrawControl.remove();
      }
    }
    return;
  }

  // Try multiple approaches to find and remove the control
  let controlElement = null;

  // Method 1: Try the panel's built-in removeControl method first
  if (panel.removeControl) {
    panel.removeControl(controlId);
    // Check if it was actually removed
    controlElement = el.querySelector(`#${controlId}`);
    if (!controlElement) {
      return;
    }
  }

  // Method 2: Look for control wrapper with the ID (should have panel-control-item class)
  controlElement = el.querySelector(`#${controlId}.panel-control-item`);
  if (controlElement) {
    controlElement.remove();
    return;
  }

  // Method 3: Look for any element with the controlId within the panel
  const panelContentEl = el.querySelector(`#${panelId}-content`);
  if (panelContentEl) {
    controlElement = panelContentEl.querySelector(`#${controlId}`);
    if (controlElement) {
      // Remove the entire section if it's a panel control item
      const section = controlElement.closest(".panel-control-item");
      if (section) {
        section.remove();
      } else {
        controlElement.remove();
      }
      return;
    }
  }

  // Method 4: Direct removal fallback
  controlElement = el.querySelector(`#${controlId}`);
  if (controlElement) {
    controlElement.remove();
    return;
  }

  // Method 3: Try searching within the panel content specifically
  const panelContent = el.querySelector(`#${panelId}-content`);
  if (panelContent) {
    controlElement = panelContent.querySelector(`#${controlId}`);
    if (controlElement) {
      controlElement.remove();
      return;
    }
  }

  console.warn(`Could not find control ${controlId} in panel ${panelId}`);
}

/**
 * Add a control panel to the map that can contain multiple controls.
 *
 * @param {object} widgetInstance   Toro widget object.
 * @param {string} panelId          Unique ID for the control panel.
 * @param {object} options          Options for the control panel.
 *                                  Can include:
 *                                    - position: string (default "bottom-left")
 *                                    - title: string - Panel title
 *                                    - showTitle: boolean (default true if title provided)
 *                                    - collapsible: boolean (default false) - Whether panel can be collapsed
 *                                    - collapsed: boolean (default false) - Initial collapsed state
 *                                    - controls: array - Array of control configurations to add
 *                                    - customControls: array - Array of custom HTML controls
 * @return {void}
 */
function addControlPanel(el, panelId, options = {}) {
  const widgetInstance = el.widgetInstance;
  const element = widgetInstance.getElement();
  const map = widgetInstance.getMap();
  const title = options.title;
  const showTitle = title && options.showTitle !== false;
  const collapsible = options.collapsible || false;
  const collapsed = options.collapsed || false;
  const direction = options.direction || "column";

  // Generate collapse button if collapsible
  const collapseButton = collapsible
    ? `<button class="panel-collapse-btn" id="${panelId}-collapse-btn">${
        collapsed ? "▶" : "▼"
      }</button>`
    : "";

  // HTML for the control panel container
  const html = `
    <div class="control-panel direction-${direction}" id="${panelId}-panel">
      ${
        showTitle
          ? `
        <div class="panel-header">
          ${collapseButton}
          <div class="panel-title">${title}</div>
        </div>
      `
          : ""
      }
      <div class="panel-content" id="${panelId}-content" style="display: ${
    collapsed ? "none" : "flex"
  }; flex-direction: ${direction};">
        <!-- Controls will be added here -->
      </div>
    </div>
  `;

  // Add the control panel to the map
  addCustomControl(map, panelId, html, options.position || "bottom-left");

  // Setup collapse functionality
  if (collapsible) {
    setTimeout(() => {
      const collapseBtn = el.querySelector(`#${panelId}-collapse-btn`);
      const panelContent = el.querySelector(`#${panelId}-content`);

      if (collapseBtn && panelContent) {
        collapseBtn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();

          const isCollapsed = panelContent.style.display === "none";
          panelContent.style.display = isCollapsed ? "flex" : "none";
          collapseBtn.textContent = isCollapsed ? "▼" : "▶";
        });
      }
    }, 100);
  }

  // Ensure the control is clickable by setting pointer events
  setTimeout(() => {
    const controlPanel = el.querySelector("#" + panelId);
    if (controlPanel) {
      controlPanel.style.pointerEvents = "auto";
      controlPanel.style.zIndex = "1000";

      // Set pointer events on all child elements
      const allElements = controlPanel.querySelectorAll("*");
      allElements.forEach((el) => {
        el.style.pointerEvents = "auto";
      });
    }
  }, 100);

  // Store reference for external access
  if (!map._controlPanels) {
    map._controlPanels = {};
  }

  map._controlPanels[panelId] = {
    addControl: function (
      controlHTML,
      controlId = null,
      sectionTitle = null,
      panelClass = null,
      groupId = null
    ) {
      // If groupId is specified, add control to the group instead
      if (groupId) {
        return this.addControlToGroup(
          controlHTML,
          controlId,
          sectionTitle,
          panelClass,
          groupId
        );
      }

      const panelContent = el.querySelector(`#${panelId}-content`);
      if (panelContent) {
        const controlDiv = document.createElement("div");
        if (controlId) {
          controlDiv.id = controlId;
        }
        controlDiv.className =
          "panel-control-item" + (panelClass ? ` ${panelClass}` : "");

        // Add section title if provided
        const sectionHTML = sectionTitle
          ? `<div class="control-section-title">${sectionTitle}</div>`
          : "";
        controlDiv.innerHTML = sectionHTML + controlHTML;

        panelContent.appendChild(controlDiv);

        // Ensure new control has proper pointer events
        setTimeout(() => {
          const allElements = controlDiv.querySelectorAll("*");
          allElements.forEach((el) => {
            el.style.pointerEvents = "auto";
          });
        }, 50);

        return controlDiv;
      }
      return null;
    },
    addControlToGroup: function (
      controlHTML,
      controlId = null,
      sectionTitle = null,
      panelClass = null,
      groupId
    ) {
      const groupElement = el.querySelector(`#${groupId}`);
      if (!groupElement) {
        console.warn(`Control group with ID ${groupId} not found`);
        return null;
      }

      const groupContent = groupElement.querySelector(".control-group-content");
      if (groupContent) {
        const controlDiv = document.createElement("div");
        if (controlId) {
          controlDiv.id = controlId;
        }
        controlDiv.className =
          "panel-control-item group-control-item" +
          (panelClass ? ` ${panelClass}` : "");

        // Add section title if provided (for individual controls within groups)
        const sectionHTML = sectionTitle
          ? `<div class="control-section-title">${sectionTitle}</div>`
          : "";
        controlDiv.innerHTML = sectionHTML + controlHTML;

        groupContent.appendChild(controlDiv);

        // Ensure new control has proper pointer events
        setTimeout(() => {
          const allElements = controlDiv.querySelectorAll("*");
          allElements.forEach((el) => {
            el.style.pointerEvents = "auto";
          });
        }, 50);

        return controlDiv;
      }
      return null;
    },
    removeControl: function (controlId) {
      const controlElement = el.querySelector("#" + controlId);
      if (
        controlElement &&
        controlElement.classList.contains("panel-control-item")
      ) {
        controlElement.remove();
        return;
      }
    },
    clear: function () {
      const panelContent = el.querySelector(`#${panelId}-content`);
      if (panelContent) {
        panelContent.innerHTML = "";
      }
    },
    collapse: function () {
      const panelContent = el.querySelector(`#${panelId}-content`);
      const collapseBtn = el.querySelector(`#${panelId}-collapse-btn`);
      if (panelContent) {
        panelContent.style.display = "none";
        if (collapseBtn) collapseBtn.textContent = "▶";
      }
    },
    expand: function () {
      const panelContent = el.querySelector(`#${panelId}-content`);
      const collapseBtn = el.querySelector(`#${panelId}-collapse-btn`);
      if (panelContent) {
        panelContent.style.display = "flex";
        if (collapseBtn) collapseBtn.textContent = "▼";
      }
    },
  };

  // Add initial controls if specified
  if (options.controls) {
    options.controls.forEach((controlConfig) => {
      addControlToPanel(element, panelId, controlConfig);
    });
  }

  // Add custom controls if specified
  if (options.customControls) {
    options.customControls.forEach((customControl) => {
      map._controlPanels[panelId].addControl(
        customControl.html,
        customControl.id || null,
        customControl.title || null,
        "toro-custom-panel-control"
      );
    });
  }
}

/**
 * Add HTML content directly to an existing control panel.
 *
 * @param {object} widgetInstance   Toro widget object.
 * @param {string} panelId          ID of the target control panel.
 * @param {string} htmlContent      HTML content to add to the panel.
 * @param {string} sectionTitle     Optional section title for the control.
 * @param {string} controlId        Optional ID for the control element.
 * @param {string} groupId          Optional group ID to add the control to a specific group.
 * @return {void}
 */
function addHtmlToPanel(
  widgetInstance,
  panelId,
  htmlContent,
  sectionTitle = null,
  controlId = null,
  groupId = null
) {
  const map = widgetInstance.getMap();
  const panel = map._controlPanels && map._controlPanels[panelId];

  if (!panel) {
    console.warn(`Control panel with ID ${panelId} not found`);
    return;
  }

  // Use the panel's addControl method to add the HTML
  panel.addControl(htmlContent, controlId, sectionTitle, null, groupId);
}

/**
 * Add a specific control to an existing control panel.
 *
 * @param {object} widgetInstance   Toro widget object.
 * @param {string} panelId          ID of the target control panel.
 * @param {object} controlConfig    Configuration for the control to add.
 *                                  Should include:
 *                                    - type: string - Control type ("timeline", "speed", "custom")
 *                                    - options: object - Control-specific options
 *                                    - title: string - Section title for the control
 * @return {void}
 */
function addControlToPanel(el, panelId, controlConfig) {
  const widgetInstance = el.widgetInstance;
  const map = widgetInstance.getMap();
  const panel = map._controlPanels && map._controlPanels[panelId];

  if (!panel) {
    console.warn(`Control panel with ID ${panelId} not found`);
    return;
  }

  const controlType = controlConfig.type;
  const controlOptions = controlConfig.options || controlConfig;
  const sectionTitle = controlConfig.title || controlConfig.panelTitle;
  const groupId = controlConfig.groupId;

  // Mark that this control should be added to the panel
  controlOptions.useControlPanel = true;
  controlOptions.panelId = panelId;
  controlOptions.panelTitle = sectionTitle;
  controlOptions.groupId = groupId;

  switch (controlType) {
    case "timeline":
      // Timeline control will be added via the existing addTimelineControl function
      // The function will detect useControlPanel = true and add to the panel
      break;

    case "speed":
      // Speed control will be added via the existing addSpeedControl function
      // The function will detect useControlPanel = true and add to the panel
      break;

    case "custom":
      // Add custom HTML directly
      if (controlConfig.html || controlOptions.html) {
        // Look for controlId in the right places: options.controlId, controlConfig.controlId, controlConfig.id
        const customControlId =
          controlOptions.controlId ||
          controlConfig.controlId ||
          controlConfig.id ||
          null;
        panel.addControl(
          controlConfig.html || controlOptions.html,
          customControlId,
          sectionTitle,
          "toro-custom-panel-control",
          groupId
        );
      }
      break;

    case "cursor":
      // Add cursor coordinates control to panel
      addCursorCoordinateControlToPanel(
        widgetInstance,
        panelId,
        controlOptions,
        sectionTitle
      );
      break;

    case "zoom":
      // Add zoom control to panel
      addZoomControlToPanel(
        widgetInstance,
        panelId,
        controlOptions,
        sectionTitle
      );
      break;

    case "draw":
      // Add draw control to panel
      addDrawControlToPanel(el, panelId, controlOptions, sectionTitle);
      break;

    case "tile-selector":
      // Add tile selector control to panel
      addTileSelectorControlToPanel(
        widgetInstance,
        panelId,
        controlOptions,
        sectionTitle
      );
      break;

    case "layer-selector":
      // Add layer selector control to panel
      addLayerSelectorControlToPanel(
        widgetInstance,
        panelId,
        controlOptions,
        sectionTitle
      );
      break;

    case "cluster-toggle":
      // Add cluster toggle control to panel
      addClusterToggleControlToPanel(
        widgetInstance,
        panelId,
        controlOptions,
        sectionTitle
      );
      break;

    case "visibility-toggle":
      // Add visibility toggle control to panel
      addVisibilityToggleControlToPanel(
        widgetInstance,
        panelId,
        controlOptions,
        sectionTitle
      );
      break;

    default:
      console.warn(`Unknown control type: ${controlType}`);
  }
}

/**
 * Add cursor coordinates control to a control panel
 */
function addCursorCoordinateControlToPanel(
  widgetInstance,
  panelId,
  options,
  sectionTitle
) {
  const map = widgetInstance.getMap();
  const panel = map._controlPanels && map._controlPanels[panelId];

  if (!panel) return;

  const longLabel = options.longLabel || "Lng";
  const latLabel = options.latLabel || "Lat";

  const html = `
    <div class="cursor-coords-control">
      <div class="coord-item">
        <span class="coord-label">${longLabel}:</span>
        <span class="coord-value" id="cursor-lng-${widgetInstance.getId()}">--</span>
      </div>
      <div class="coord-item">
        <span class="coord-label">${latLabel}:</span>
        <span class="coord-value" id="cursor-lat-${widgetInstance.getId()}">--</span>
      </div>
    </div>
    <style>
      .cursor-coords-control {
        display: flex;
        gap: 10px;
        font-size: 12px;
        font-family: monospace;
      }
      .coord-item {
        display: flex;
        gap: 4px;
      }
      .coord-label {
        font-weight: bold;
      }
      .coord-value {
        min-width: 60px;
      }
    </style>
  `;

  panel.addControl(
    html,
    `cursor-coords-${widgetInstance.getId()}`,
    sectionTitle,
    "toro-cursor-coords-panel-control"
  );

  // Add mouse move listener
  map.on("mousemove", function (e) {
    const lngElement = document.getElementById(
      `cursor-lng-${widgetInstance.getId()}`
    );
    const latElement = document.getElementById(
      `cursor-lat-${widgetInstance.getId()}`
    );

    if (lngElement && latElement) {
      lngElement.textContent = e.lngLat.lng.toFixed(6);
      latElement.textContent = e.lngLat.lat.toFixed(6);
    }
  });
}

/**
 * Add zoom control to a control panel
 */
function addZoomControlToPanel(widgetInstance, panelId, options, sectionTitle) {
  const map = widgetInstance.getMap();
  const panel = map._controlPanels && map._controlPanels[panelId];

  if (!panel) return;

  const html = `
    <div class="zoom-control-panel">
      <button class="zoom-in-btn" title="Zoom In">+</button>
      <button class="zoom-out-btn" title="Zoom Out">−</button>
    </div>
    <style>
      .zoom-control-panel {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .zoom-control-panel button {
        width: 30px;
        height: 30px;
        border: 1px solid #ccc;
        background: white;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .zoom-control-panel button:hover {
        background: #f0f0f0;
      }
      .zoom-control-panel button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    </style>
  `;

  panel.addControl(
    html,
    `zoom-control-${widgetInstance.getId()}`,
    sectionTitle,
    "toro-zoom-panel-control"
  );

  // Add event listeners
  setTimeout(() => {
    const container = widgetInstance
      .getElement()
      .querySelector(`#zoom-control-${widgetInstance.getId()}`);
    if (container) {
      const zoomInBtn = container.querySelector(".zoom-in-btn");
      const zoomOutBtn = container.querySelector(".zoom-out-btn");

      if (zoomInBtn) {
        zoomInBtn.addEventListener("click", () => {
          map.zoomIn();
        });
      }

      if (zoomOutBtn) {
        zoomOutBtn.addEventListener("click", () => {
          map.zoomOut();
        });
      }
    }
  }, 100);
}

/**
 * Add draw control to a control panel
 */
function addDrawControlToPanel(el, panelId, options, sectionTitle) {
  const widgetInstance = el.widgetInstance;
  const map = widgetInstance.getMap();
  const panel = map._controlPanels && map._controlPanels[panelId];
  const mapElement = el;

  if (!panel) return;

  // Create the actual draw control for panel use
  const modes = options.modes
    ? Array.isArray(options.modes[0])
      ? options.modes[0]
      : options.modes
    : ["polygon", "trash"];

  // Use the existing addDrawControl function if draw control doesn't exist yet
  if (!mapElement.draw) {
    // Use addDrawControl to create the draw instance with proper setup
    addDrawControl(
      mapElement,
      "top-left", // Position (will be hidden anyway)
      modes,
      options.activeColour || "#007cbf",
      options.inactiveColour || "#999999",
      options.modeLabels || {},
      options.controlId
    );

    // Hide the default MapboxDraw control UI since we're using panel buttons
    setTimeout(() => {
      // Find draw controls specifically within this map element
      const drawControls = mapElement.querySelector(
        ".mapboxgl-ctrl-group.mapboxgl-ctrl"
      );
      if (
        drawControls &&
        drawControls.querySelector(
          ".mapbox-gl-draw_polygon, .mapbox-gl-draw_trash, .mapbox-gl-draw_line"
        )
      ) {
        drawControls.style.display = "none";
      }
    }, 100);
  }

  // Create custom panel buttons that interact with the real draw control
  const modeLabels = options.modeLabels || {};
  let buttonsHtml = "";

  modes.forEach((mode) => {
    const label =
      modeLabels[mode] || mode.charAt(0).toUpperCase() + mode.slice(1);
    // Map mode names to MapboxDraw CSS classes and use proper CSS class styling
    const modeClass = mode === "line" ? "line_string" : mode;
    buttonsHtml += `<button class="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_${modeClass}" data-mode="${mode}" title="${label}"></button>`;
  });

  const html = `
    <div class="draw-control-panel mapboxgl-ctrl-group" id="draw-control-panel-${widgetInstance.getId()}">
      ${buttonsHtml}
    </div>
  `;

  panel.addControl(
    html,
    `draw-control-${widgetInstance.getId()}`,
    sectionTitle,
    "toro-draw-panel-control"
  );

  // Add event listeners to make the buttons functional
  setTimeout(() => {
    const drawPanel = document.getElementById(
      `draw-control-panel-${widgetInstance.getId()}`
    );
    if (drawPanel && mapElement.draw) {
      const buttons = drawPanel.querySelectorAll(
        ".mapbox-gl-draw_ctrl-draw-btn"
      );

      buttons.forEach((button) => {
        button.addEventListener("click", function () {
          const mode = this.getAttribute("data-mode");

          // Remove active class from all buttons
          buttons.forEach((btn) => btn.classList.remove("active"));

          // Handle different draw modes
          if (mode === "polygon") {
            this.classList.add("active");
            mapElement.draw.changeMode("draw_polygon");
          } else if (mode === "line") {
            this.classList.add("active");
            mapElement.draw.changeMode("draw_line_string");
          } else if (mode === "trash") {
            // Delete all features
            const features = mapElement.draw.getAll();
            if (features.features.length > 0) {
              mapElement.draw.deleteAll();
            }
          } else if (mode === "simple_select") {
            this.classList.add("active");
            mapElement.draw.changeMode("simple_select");
          }
        });
      });

      // Listen for draw events to update button states
      map.on("draw.modechange", function (e) {
        buttons.forEach((btn) => btn.classList.remove("active"));

        if (e.mode === "draw_polygon") {
          const polygonBtn = drawPanel.querySelector('[data-mode="polygon"]');
          if (polygonBtn) polygonBtn.classList.add("active");
        } else if (e.mode === "draw_line_string") {
          const lineBtn = drawPanel.querySelector('[data-mode="line"]');
          if (lineBtn) lineBtn.classList.add("active");
        }
      });

      // Add Shiny event handlers if in Shiny mode
      if (HTMLWidgets.shinyMode) {
        // Trigger Shiny input when a feature is created
        map.on("draw.create", function (e) {
          const feature = e.features[0];
          const geojson = JSON.stringify(feature);
          Shiny.setInputValue(mapElement.id + "_shape_created", geojson, {
            priority: "event",
          });
        });

        // Trigger Shiny input when a feature is deleted
        map.on("draw.delete", function (e) {
          const feature = e.features[0];
          const geojson = JSON.stringify(feature);
          Shiny.setInputValue(mapElement.id + "_shape_deleted", geojson, {
            priority: "event",
          });
        });

        // Trigger Shiny input when a feature is updated
        map.on("draw.update", function (e) {
          const feature = e.features[0];
          const geojson = JSON.stringify(feature);
          Shiny.setInputValue(mapElement.id + "_shape_updated", geojson, {
            priority: "event",
          });
        });
      }
    }
  }, 100);
}

/**
 * Add tile selector control to a control panel
 */
function addTileSelectorControlToPanel(
  widgetInstance,
  panelId,
  options,
  sectionTitle
) {
  const map = widgetInstance.getMap();
  const panel = map._controlPanels && map._controlPanels[panelId];

  if (!panel) return;

  // Use the existing tile selector control logic
  const tileSelectorOptions = {
    ...options,
    useControlPanel: true,
    panelId: panelId,
    panelTitle: sectionTitle,
    groupId: options.groupId,
  };

  // Create the tile change callback
  const tileChangeCallback = function (selectedTile) {
    // Use the existing setTileLayer function if available
    if (typeof setTileLayer === "function") {
      const mapElement = document.getElementById(widgetInstance.id);
      setTileLayer(mapElement, selectedTile);
    }
  };

  // Add the tile selector control
  addTileSelectorControl(
    widgetInstance,
    tileChangeCallback,
    tileSelectorOptions
  );
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

  // Generate unique IDs by appending map ID
  const mapId = widgetInstance.getId();
  const timelineContainerId = `timeline-control-container-${mapId}`;
  const playPauseId = `timeline-play-pause-${mapId}`;
  const currentDateId = `timeline-current-date-${mapId}`;
  const sliderId = `timeline-slider-${mapId}`;
  const controlId = `timeline-control-${mapId}`;

  // HTML for the control
  const html = `
    <div class="timeline-control-container">
      <button id="${playPauseId}" class="timeline-play-btn">▶</button>
      <div class="timeline-axis-container">
        <!-- Current date display above slider - always visible -->
        <div id="${currentDateId}">${start}</div>
        <!-- Slider with custom styling -->
        <div class="timeline-slider-container">
          <input type="range" id="${sliderId}" min="0" max="100" value="0" />
          
          <!-- Date ticks -->
          ${axisHTML}
        </div>
      </div>
    </div>
    <style>
      
    </style>
  `;

  // Add the control to the map or control panel
  const useControlPanel = options.useControlPanel || false;
  const panelId = options.panelId;

  if (
    useControlPanel &&
    panelId &&
    map._controlPanels &&
    map._controlPanels[panelId]
  ) {
    // Add to existing control panel
    const groupId = options.groupId || null;
    map._controlPanels[panelId].addControl(
      html,
      timelineContainerId,
      options.panelTitle,
      "toro-timeline-panel-control",
      groupId
    );
  } else {
    // Add as standalone control
    addCustomControl(map, controlId, html, options.position || "bottom-left");
  }

  // Ensure the control is clickable by setting pointer events
  setTimeout(() => {
    const timelineControl = document.getElementById(controlId);
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
  let handlePlayPause, handleSliderChange;

  // Define handler functions that can be accessed by both setupEventHandlers and enable method
  handlePlayPause = function (e) {
    e.preventDefault();
    e.stopPropagation();

    // Debounce rapid clicks (ignore clicks within 200ms)
    const now = Date.now();
    if (now - lastClickTime < 200) {
      console.log("Ignoring rapid click");
      return;
    }
    lastClickTime = now;

    playing = !playing;
    if (playPauseBtn) {
      playPauseBtn.innerHTML = playing ? "⏸" : "▶";
    }

    // Disable/enable slider based on play state
    if (timelineSlider) {
      timelineSlider.disabled = playing;
      timelineSlider.style.opacity = playing ? "0.5" : "1";
      timelineSlider.style.cursor = playing ? "not-allowed" : "pointer";
    }

    if (typeof onPlayPause === "function") {
      onPlayPause(playing);
    }
  };

  handleSliderChange = function (e) {
    e.stopPropagation();
    updateSliderAppearance();

    if (!playing && typeof onSliderChange === "function") {
      const progress = parseFloat(this.value) / 100;
      onSliderChange(progress);
    }
  };

  // Function to update current date display and slider appearance
  updateSliderAppearance = function () {
    if (!timelineSlider) return; // Guard clause

    const progress = parseFloat(timelineSlider.value) / 100;

    // Use stored dates if available, otherwise fall back to original dates
    const currentStartDate = map._timelineControl?.startDate || startDateObj;
    const currentEndDate = map._timelineControl?.endDate || endDateObj;

    const currentDate = new Date(
      currentStartDate.getTime() +
        progress * (currentEndDate.getTime() - currentStartDate.getTime())
    );
    const currentDateDisplay = document.getElementById(currentDateId);

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
      const progressColor = playing
        ? "var(--toro-secondary)"
        : "var(--toro-primary)";
      timelineSlider.style.background = `linear-gradient(to right, ${progressColor} 0%, ${progressColor} ${
        progress * 100
      }%, #ddd ${progress * 100}%, #ddd 100%)`;
    }
  };

  function setupEventHandlers() {
    playPauseBtn = document.getElementById(playPauseId);
    timelineSlider = document.getElementById(sliderId);

    if (!playPauseBtn || !timelineSlider) {
      console.warn("Timeline control elements not found, retrying...");
      setTimeout(setupEventHandlers, 50);
      return;
    }

    // Check if timeline should be disabled (no animation callbacks provided)
    const isTimelineDisabled =
      typeof onPlayPause !== "function" && typeof onSliderChange !== "function";

    if (isTimelineDisabled) {
      // Disable timeline controls when no animation is connected
      // Add disabled class to the timeline control container
      const timelineContainer = timelineSlider.closest(
        ".timeline-control-container"
      );
      if (timelineContainer) {
        timelineContainer.classList.add("disabled");
      }

      playPauseBtn.disabled = true;
      playPauseBtn.title = "Connect an animation to enable timeline controls";

      timelineSlider.disabled = true;
      timelineSlider.title = "Connect an animation to enable timeline controls";

      // Still update appearance but don't add interactive event handlers
      setTimeout(updateSliderAppearance, 150);
      return;
    }

    // Use event handlers defined outside this function
    playPauseBtn.addEventListener("click", handlePlayPause);
    playPauseBtn.addEventListener("mousedown", function (e) {
      e.stopPropagation();
    });

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
    controlId: controlId,
    timelineContainerId: timelineContainerId,
    playPauseId: playPauseId,
    sliderId: sliderId,
    currentDateId: currentDateId,
    playPauseBtn: playPauseBtn,
    slider: timelineSlider,
    updateAppearance: updateSliderAppearance,
    startDate: startDateObj,
    endDate: endDateObj,
    isDisabled:
      typeof onPlayPause !== "function" && typeof onSliderChange !== "function",
    enable: function (newOnPlayPause, newOnSliderChange) {
      // Enable the timeline control and set up event handlers
      if (playPauseBtn && timelineSlider) {
        // Remove disabled class and enable controls
        const timelineContainer = timelineSlider.closest(
          ".timeline-control-container"
        );
        if (timelineContainer) {
          timelineContainer.classList.remove("disabled");
        }

        playPauseBtn.disabled = false;
        playPauseBtn.title = "";

        timelineSlider.disabled = false;
        timelineSlider.title = "";

        // Update callbacks
        onPlayPause = newOnPlayPause;
        onSliderChange = newOnSliderChange;

        // Remove existing event listeners to avoid duplicates
        playPauseBtn.removeEventListener("click", handlePlayPause);
        timelineSlider.removeEventListener("input", handleSliderChange);

        // Set up event handlers with new callbacks
        if (typeof onPlayPause === "function") {
          playPauseBtn.addEventListener("click", handlePlayPause);
        }
        if (typeof onSliderChange === "function") {
          timelineSlider.addEventListener("input", handleSliderChange);
        }

        this.isDisabled = false;
      }
    },
    disable: function () {
      // Disable the timeline control
      if (playPauseBtn && timelineSlider) {
        // Add disabled class
        const timelineContainer = timelineSlider.closest(
          ".timeline-control-container"
        );
        if (timelineContainer) {
          timelineContainer.classList.add("disabled");
        }

        playPauseBtn.disabled = true;
        playPauseBtn.title = "Connect an animation to enable timeline controls";

        timelineSlider.disabled = true;
        timelineSlider.title =
          "Connect an animation to enable timeline controls";

        this.isDisabled = true;
      }
    },
    setProgress: function (progress) {
      // Update slider position (0-1 range to 0-100)
      if (timelineSlider) {
        // Temporarily disable events to prevent feedback loops
        const oldOnInput = timelineSlider.oninput;
        timelineSlider.oninput = null;

        timelineSlider.value = Math.round(progress * 100);
        updateSliderAppearance();

        // Re-enable events
        timelineSlider.oninput = oldOnInput;
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
    updateDateRange: function (newStartDate, newEndDate, maxTicks = 3) {
      // Update the timeline control with new date range and rebuild the axis
      const startDateObj = new Date(newStartDate);
      const endDateObj = new Date(newEndDate);
      const totalDays = Math.ceil(
        (endDateObj - startDateObj) / (1000 * 60 * 60 * 24)
      );

      // Update the current date display
      const currentDateDisplay = document.getElementById(currentDateId);
      if (currentDateDisplay) {
        const formattedDate = startDateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        currentDateDisplay.textContent = formattedDate;
      }

      // Reset slider to start
      if (timelineSlider) {
        timelineSlider.value = 0;
      }

      // Rebuild axis ticks with new date range
      const axisContainer = document.querySelector(
        `#${timelineContainerId} .timeline-axis-container`
      );
      if (axisContainer) {
        // Remove existing ticks
        const existingTicks = axisContainer.querySelectorAll(".timeline-tick");
        existingTicks.forEach((tick) => tick.remove());

        // Generate new axis ticks
        const majorTickPositions = [];

        if (maxTicks <= 1) {
          majorTickPositions.push(0);
        } else if (maxTicks === 2) {
          majorTickPositions.push(0, totalDays);
        } else {
          majorTickPositions.push(0);
          const intermediateCount = maxTicks - 2;
          for (let i = 1; i <= intermediateCount; i++) {
            const position = Math.floor(
              (totalDays * i) / (intermediateCount + 1)
            );
            majorTickPositions.push(position);
          }
          majorTickPositions.push(totalDays);
        }

        const uniquePositions = [...new Set(majorTickPositions)].sort(
          (a, b) => a - b
        );

        // Create major ticks
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

          const tickElement = document.createElement("div");
          tickElement.className = "timeline-tick major-tick";
          tickElement.style.left = `${position}%`;
          tickElement.innerHTML = `
            <div class="timeline-tick-line"></div>
            <div class="timeline-tick-label">${shortDate}</div>
          `;
          axisContainer.appendChild(tickElement);
        });

        // Create minor ticks
        const minorTickInterval = Math.max(1, Math.floor(totalDays / 12));
        for (let i = minorTickInterval; i < totalDays; i += minorTickInterval) {
          if (!uniquePositions.includes(i)) {
            const position = (i / totalDays) * 100;
            const tickElement = document.createElement("div");
            tickElement.className = "timeline-tick minor-tick";
            tickElement.style.left = `${position}%`;
            tickElement.innerHTML = '<div class="timeline-tick-line"></div>';
            axisContainer.appendChild(tickElement);
          }
        }
      }

      // Store new date range for future reference BEFORE updating appearance
      map._timelineControl.startDate = startDateObj;
      map._timelineControl.endDate = endDateObj;

      // Update the slider appearance with new date range
      updateSliderAppearance();
    },
  };
}

/**
 * Add a speed control to the map for controlling animation speed.
 *
 * @param {object} widgetInstance   Toro widget object.
 * @param {function} onSpeedChange  Callback for speed change.
 * @param {object} options          Options for the speed control.
 *                                  Can include:
 *                                    - position: string (default "top-right")
 *                                    - values: array (default [0.5, 1, 2]) - Speed values
 *                                    - labels: array (default ["Slow", "Normal", "Fast"]) - Speed labels
 *                                    - defaultIndex: number (default 1) - Default speed index
 * @return {void}
 */
function addSpeedControl(widgetInstance, onSpeedChange, options = {}) {
  const map = widgetInstance.getMap();

  // Set default options
  const speedValues = options.values || [0.5, 1, 2];
  const speedLabels = options.labels || ["Slow", "Normal", "Fast"];
  const defaultIndex =
    options.defaultIndex !== undefined ? options.defaultIndex : 1;

  // Validate inputs
  if (speedValues.length !== speedLabels.length) {
    console.warn("Speed values and labels arrays must have the same length");
    return;
  }

  if (defaultIndex < 0 || defaultIndex >= speedValues.length) {
    console.warn("Default index is out of range");
    return;
  }

  // Generate unique IDs by appending map ID
  const mapId = widgetInstance.getId();
  const speedSliderId = `speed-slider-${mapId}`;
  const speedControlId = `speed-control-${mapId}`;

  // Generate tick marks for the slider
  const ticksHTML = speedLabels
    .map((label, index) => {
      const position = (index / (speedLabels.length - 1)) * 100;
      return `
      <div class="speed-tick" style="left: ${position}%;">
        <div class="speed-tick-label">${label}</div>
      </div>
    `;
    })
    .join("");

  // HTML for the speed control
  const html = `
    <div class="speed-control-container">
      <div class="speed-slider-container">
        <input type="range" id="${speedSliderId}" min="0" max="${
    speedValues.length - 1
  }" 
               value="${defaultIndex}" step="1"  />
        ${ticksHTML}
      </div>
    </div>
  `;

  // Add the control to the map or control panel
  const useControlPanel = options.useControlPanel || false;
  const panelId = options.panelId;

  if (
    useControlPanel &&
    panelId &&
    map._controlPanels &&
    map._controlPanels[panelId]
  ) {
    // Add to existing control panel
    const groupId = options.groupId || null;
    map._controlPanels[panelId].addControl(
      html,
      speedControlId,
      options.panelTitle,
      "toro-speed-panel-control",
      groupId
    );
  } else {
    // Add as standalone control
    addCustomControl(
      map,
      speedControlId,
      html,
      options.position || "top-right"
    );
  }

  // Ensure the control is clickable by setting pointer events
  setTimeout(() => {
    const speedControl = document.getElementById(speedControlId);
    if (speedControl) {
      speedControl.style.pointerEvents = "auto";
      speedControl.style.zIndex = "1000";

      // Set pointer events on all child elements
      const allElements = speedControl.querySelectorAll("*");
      allElements.forEach((el) => {
        el.style.pointerEvents = "auto";
      });
    }
  }, 100);

  // Setup event handlers with retry mechanism
  let currentSpeed = speedValues[defaultIndex];
  let currentIndex = defaultIndex;
  let handleSpeedChange;

  // Define speed change handler function
  handleSpeedChange = function (e) {
    e.preventDefault();
    e.stopPropagation();

    const sliderIndex = parseInt(this.value);
    const speed = speedValues[sliderIndex];

    currentSpeed = speed;
    currentIndex = sliderIndex;

    if (typeof onSpeedChange === "function") {
      onSpeedChange(speed);
    }
  };

  function setupEventHandlers() {
    const speedSlider = document.getElementById(speedSliderId);

    if (!speedSlider) {
      console.warn("Speed control slider not found, retrying...");
      setTimeout(setupEventHandlers, 50);
      return;
    }

    // Check if speed control should be disabled (no animation callback provided)
    const isSpeedDisabled = typeof onSpeedChange !== "function";

    if (isSpeedDisabled) {
      // Disable speed control when no animation is connected
      // Add disabled class to the speed control container
      const speedContainer = speedSlider.closest(".speed-control-container");
      if (speedContainer) {
        speedContainer.classList.add("disabled");
      }

      speedSlider.disabled = true;
      speedSlider.title = "Connect an animation to enable speed controls";

      // Don't add interactive event handlers when disabled
      return;
    }

    // Add change handler to speed slider using the handler defined outside this function
    speedSlider.addEventListener("input", handleSpeedChange);

    speedSlider.addEventListener("mousedown", function (e) {
      e.stopPropagation();
    });
  }

  setupEventHandlers();

  // Store reference for external access
  map._speedControl = {
    speedValues: speedValues,
    speedLabels: speedLabels,
    getCurrentSpeed: function () {
      return currentSpeed;
    },
    getCurrentIndex: function () {
      return currentIndex;
    },
    setSpeed: function (speed) {
      // Find the closest available speed option
      const closestIndex = speedValues.reduce((closest, current, index) => {
        return Math.abs(current - speed) <
          Math.abs(speedValues[closest] - speed)
          ? index
          : closest;
      }, 0);

      currentSpeed = speedValues[closestIndex];
      currentIndex = closestIndex;

      // Update slider position
      const speedSlider = document.getElementById(speedSliderId);
      if (speedSlider) {
        speedSlider.value = closestIndex;
      }

      if (typeof onSpeedChange === "function") {
        onSpeedChange(currentSpeed);
      }
    },
    setIndex: function (index) {
      if (index >= 0 && index < speedValues.length) {
        currentSpeed = speedValues[index];
        currentIndex = index;

        // Update slider position
        const speedSlider = document.getElementById(speedSliderId);
        if (speedSlider) {
          speedSlider.value = index;
        }

        if (typeof onSpeedChange === "function") {
          onSpeedChange(currentSpeed);
        }
      }
    },
    enable: function (newOnSpeedChange) {
      // Enable the speed control and set up event handlers
      const speedSlider = document.getElementById(speedSliderId);
      if (speedSlider) {
        // Remove disabled class and enable control
        const speedContainer = speedSlider.closest(".speed-control-container");
        if (speedContainer) {
          speedContainer.classList.remove("disabled");
        }

        speedSlider.disabled = false;
        speedSlider.title = "";

        // Update callback
        onSpeedChange = newOnSpeedChange;

        // Remove existing event listener to avoid duplicates
        speedSlider.removeEventListener("input", handleSpeedChange);

        // Set up event handler with new callback
        if (typeof onSpeedChange === "function") {
          speedSlider.addEventListener("input", handleSpeedChange);
        }

        this.isDisabled = false;
      }
    },
    disable: function () {
      // Disable the speed control
      const speedSlider = document.getElementById(speedSliderId);
      if (speedSlider) {
        // Add disabled class
        const speedContainer = speedSlider.closest(".speed-control-container");
        if (speedContainer) {
          speedContainer.classList.add("disabled");
        }

        speedSlider.disabled = true;
        speedSlider.title = "Connect an animation to enable speed controls";

        this.isDisabled = true;
      }
    },
    isDisabled: typeof onSpeedChange !== "function",
  };
}

/**
 * Add a tile selector control to the map for switching between tile layers.
 *
 * @param {object} widgetInstance   Toro widget object.
 * @param {function} onTileChange   Callback for tile change.
 * @param {object} options          Options for the tile selector control.
 *                                  Can include:
 *                                    - availableTiles: array of tile IDs
 *                                    - labels: object mapping tile IDs to display labels
 *                                    - defaultTile: string default tile ID
 *                                    - position: string (default "top-right")
 *                                    - useControlPanel: boolean
 *                                    - panelId: string panel ID if using control panel
 *                                    - panelTitle: string section title for control panel
 * @returns {void}
 */
function addTileSelectorControl(widgetInstance, onTileChange, options = {}) {
  const map = widgetInstance.getMap();

  // Set default options - get available tiles from the map's loaded tiles
  const mapElement = document.querySelector(
    `[data-for="${widgetInstance.getId()}"]`
  );
  const loadedTiles =
    mapElement?.tileLayers || options.availableTiles || map.getAvailableTiles();
  const availableTiles = options.availableTiles || loadedTiles;
  const labels = options.labels || {};

  // Generate unique IDs using the map ID
  const tileSelectorId = `tile-selector-${widgetInstance.getId()}`;

  // Use current active tile as default, falling back to first available tile
  const activeTile = widgetInstance.getCurrentTiles
    ? widgetInstance.getCurrentTiles()
    : null;
  const defaultTile =
    options.defaultTile ||
    (availableTiles.includes(activeTile) ? activeTile : availableTiles[0]);

  // Generate select options HTML
  const selectOptions = availableTiles
    .map((tileId) => {
      const label = labels[tileId] || tileId;
      const selected = tileId === defaultTile ? "selected" : "";
      return `<option value="${tileId}" ${selected}>${label}</option>`;
    })
    .join("");

  // HTML for the control
  const html = `
    <div id="tile-selector-container-${widgetInstance.getId()}" class="tile-selector-container">
      <select id="${tileSelectorId}" class="tile-selector">
        ${selectOptions}
      </select>
    </div>
    <style>
      .tile-selector-container {
        margin-bottom: 10px;
      }
      
      .tile-selector-title {
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 5px;
        color: #333;
      }
      
      .tile-selector {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: white;
        font-size: 13px;
        cursor: pointer;
        outline: none;
      }
      
      .tile-selector:focus {
        border-color: #007cba;
        box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.2);
      }
      
      .tile-selector:hover {
        border-color: #999;
      }
      
      .tile-selector-container.disabled {
        opacity: 0.4;
        pointer-events: none;
      }
      
      .tile-selector-container.disabled .tile-selector {
        background-color: #f5f5f5;
        cursor: not-allowed;
      }
    </style>
  `;

  // Add the control to the map or control panel
  const useControlPanel = options.useControlPanel || false;
  const panelId = options.panelId;
  const selectControlId = `tile-selector-control-${widgetInstance.getId()}`;

  if (
    useControlPanel &&
    panelId &&
    map._controlPanels &&
    map._controlPanels[panelId]
  ) {
    // Add to existing control panel
    const groupId = options.groupId || null;
    addHtmlToPanel(
      widgetInstance,
      panelId,
      html,
      options.panelTitle,
      null,
      groupId
    );
  } else {
    // Add as standalone control
    addCustomControl(
      widgetInstance,
      selectControlId,
      html,
      options.position || "top-right"
    );
  }

  // Ensure the control is clickable by setting pointer events
  setTimeout(() => {
    const tileSelectorControl = document.getElementById(selectControlId);
    if (tileSelectorControl) {
      tileSelectorControl.style.pointerEvents = "auto";
      tileSelectorControl.style.zIndex = "1000";

      // Set pointer events on all child elements
      const allElements = tileSelectorControl.querySelectorAll("*");
      allElements.forEach((el) => {
        el.style.pointerEvents = "auto";
      });
    }
  }, 100);

  // Setup event handlers with retry mechanism
  let currentTile = defaultTile;
  let handleTileChange;

  // Define tile change handler function
  handleTileChange = function (e) {
    e.preventDefault();
    e.stopPropagation();

    const selectedTile = this.value;
    currentTile = selectedTile;

    if (typeof onTileChange === "function") {
      onTileChange(selectedTile);
    }
  };

  const tileSelector = document.getElementById(tileSelectorId);
  function setupEventHandlers() {
    if (!tileSelector) {
      console.warn("Tile selector control not found, retrying...");
      setTimeout(setupEventHandlers, 50);
      return;
    }

    // Check if tile selector should be disabled (no tile change callback provided)
    const isTileSelectorDisabled = typeof onTileChange !== "function";

    if (isTileSelectorDisabled) {
      // Disable tile selector when no callback is connected
      const tileSelectorContainer = tileSelector.closest(
        ".tile-selector-container"
      );
      if (tileSelectorContainer) {
        tileSelectorContainer.classList.add("disabled");
      }

      tileSelector.disabled = true;
      tileSelector.title = "Tile switching is not available";

      // Don't add interactive event handlers when disabled
      return;
    }

    // Add change handler to tile selector
    tileSelector.addEventListener("change", handleTileChange);

    tileSelector.addEventListener("mousedown", function (e) {
      e.stopPropagation();
    });
  }

  setupEventHandlers();

  // const tileSelectorId = `tile-selector-${widgetInstance.getId()}`;

  // Store reference for external access
  map._tileSelectorControl = {
    availableTiles: availableTiles,
    labels: labels,
    getCurrentTile: function () {
      return currentTile;
    },
    setTile: function (tileId) {
      if (availableTiles.includes(tileId)) {
        currentTile = tileId;

        // Update selector value
        const tileSelector = document.getElementById(tileSelectorId);
        if (tileSelector) {
          tileSelector.value = tileId;
        }

        if (typeof onTileChange === "function") {
          onTileChange(currentTile);
        }
      }
    },
    enable: function (newOnTileChange) {
      // Enable the tile selector control and set up event handlers
      const tileSelector = document.getElementById(tileSelectorId);
      if (tileSelector) {
        // Remove disabled class and enable control
        const tileSelectorContainer = tileSelector.closest(
          ".tile-selector-container"
        );
        if (tileSelectorContainer) {
          tileSelectorContainer.classList.remove("disabled");
        }

        tileSelector.disabled = false;
        tileSelector.title = "";

        // Update callback
        onTileChange = newOnTileChange;

        // Remove existing event listener to avoid duplicates
        tileSelector.removeEventListener("change", handleTileChange);

        // Set up event handler with new callback
        if (typeof onTileChange === "function") {
          tileSelector.addEventListener("change", handleTileChange);
        }

        this.isDisabled = false;
      }
    },
    disable: function () {
      // Disable the tile selector control
      const tileSelector = document.getElementById(tileSelectorId);
      if (tileSelector) {
        // Add disabled class
        const tileSelectorContainer = tileSelector.closest(
          ".tile-selector-container"
        );
        if (tileSelectorContainer) {
          tileSelectorContainer.classList.add("disabled");
        }

        tileSelector.disabled = true;
        tileSelector.title = "Tile switching is not available";

        this.isDisabled = true;
      }
    },
    isDisabled: typeof onTileChange !== "function",
  };
}

/**
 * Generate HTML content for a toggle control input.
 *
 * @param {string} type        Type of toggle ("cluster" or "visibility").
 * @param {string} layerId     ID of the layer to toggle.
 * @param {string} leftLabel       Label text for the left of the toggle.
 * @param {string} rightLabel      Label text for the right of the toggle.
 * @param {boolean} initialState Initial state of the toggle.
 * @param {string} mapId       Map ID for unique event handling.
 * @param {boolean} useInlineHandler Whether to use inline onclick handler (for panels) or return just HTML.
 * @param {boolean} includeWrapper Whether to include the control wrapper div (for panels).
 * @returns {string} HTML content for the toggle input.
 */
function generateToggleInputHtml(
  type,
  layerId,
  leftLabel,
  rightLabel,
  initialState,
  mapId,
  useInlineHandler = false,
  includeWrapper = false
) {
  const dataAttribute = type === "cluster" ? "data-clustered" : "data-visible";

  const onclickHandler = useInlineHandler
    ? `onclick="handle${
        type === "cluster" ? "Cluster" : "Visibility"
      }Toggle('${layerId}', '${mapId}', this)"`
    : "";

  const toggleHtml = `
    <label class="toro-toggle" 
           data-layer-id="${layerId}" 
           ${dataAttribute}="${initialState}"
           
           ${onclickHandler}>
           <span class="toro-toggle-label">${leftLabel || ""}</span>
      <input class="toro-toggle-checkbox" type="checkbox" ${
        initialState ? "checked" : ""
      }>
      <div class="toro-toggle-switch${initialState ? " checked" : ""}"></div>
      <span class="toro-toggle-label">${rightLabel || ""}</span>
    </label>
  `;

  // For panels, wrap in the same control container as standalone controls
  if (includeWrapper) {
    const containerClass =
      type === "cluster"
        ? "cluster-toggle-control"
        : "visibility-toggle-control";
    return `
      <div class="toro-ctrl toro-toggle-container ${containerClass}">
        ${toggleHtml}
      </div>
    `;
  }

  return toggleHtml;
}

/**
 * Add a cluster toggle control to the map.
 *
 * @param {object} map        Maplibre map instance.
 * @param {string} controlId  ID for the control.
 * @param {string} layerId    ID of the layer to toggle clustering for.
 * @param {string} leftLabel      Label text for the left side of the toggle. Default is "Toggle Clustering".
 * @param {string} rightLabel     Label text for the right side of the toggle. Default is null.
 * @param {boolean} initialState Initial clustering state. Default is false.
 * @param {string} position   Position to place the control. Default is "top-right".
 * @param {object} widgetInstance Optional widget instance for ID generation.
 * @returns {void}
 */
function addClusterToggleControl(
  map,
  controlId,
  layerId,
  leftLabel = "Toggle Clustering",
  rightLabel = null,
  initialState = false,
  position = "top-right",
  widgetInstance = null
) {
  // Generate proper namespaced ID if widgetInstance is available
  const finalControlId = widgetInstance
    ? `${controlId}-${widgetInstance.getId()}`
    : controlId;

  class ClusterToggleControl {
    onAdd(mapInstance) {
      this._container = document.createElement("div");
      this._container.id = finalControlId;
      this._container.className =
        "toro-ctrl toro-toggle-container cluster-toggle-control";

      // Use shared HTML generator
      const mapId = widgetInstance ? widgetInstance.getId() : "standalone";
      const buttonHtml = generateToggleInputHtml(
        "cluster",
        layerId,
        leftLabel,
        rightLabel,
        initialState,
        mapId,
        false
      );
      this._container.innerHTML = buttonHtml;

      // Get reference to the toggle elements
      this._toggle = this._container.querySelector(".toro-toggle");
      this._checkbox = this._container.querySelector(".toro-toggle-checkbox");

      if (!this._toggle || !this._checkbox) {
        console.error("Cluster toggle elements not found!");
        return this._container;
      }

      // Listen for both checkbox change and label click events
      this._checkbox.addEventListener("change", () => {
        const newState = this._checkbox.checked;

        // Toggle clustering
        toggleLayerClustering(mapInstance, layerId, newState);

        // Update toggle state
        this._toggle.setAttribute("data-clustered", newState.toString());
        this._checkbox.checked = newState;

        // Force visual update by managing CSS classes directly
        const switchElement = this._toggle.querySelector(".toro-toggle-switch");
        if (switchElement) {
          if (newState) {
            switchElement.classList.add("checked");
          } else {
            switchElement.classList.remove("checked");
          }
        }

        this._updateToggleState(newState);

        // Emit custom event for external listeners
        const event = new CustomEvent("cluster-toggle", {
          detail: { layerId: layerId, clustered: newState },
        });
        this._container.dispatchEvent(event);
      });

      // Listen for clicks anywhere on the toggle (labels, switch, etc.)
      this._toggle.addEventListener("click", (e) => {
        // Only prevent default if we're not clicking the checkbox directly
        if (e.target !== this._checkbox) {
          e.preventDefault();
          // Manually toggle the checkbox
          this._checkbox.checked = !this._checkbox.checked;
          // Trigger the change event
          this._checkbox.dispatchEvent(new Event("change"));
        }
        // If clicking checkbox directly, let it handle naturally
      });

      return this._container;
    }

    onRemove() {
      this._container.parentNode.removeChild(this._container);
    }

    _updateToggleState(clustered) {
      if (clustered) {
        this._toggle.title = "Click to disable clustering";
      } else {
        this._toggle.title = "Click to enable clustering";
      }
    }
  }

  map.addControl(new ClusterToggleControl(), position);
}

/**
 * Add a visibility toggle control to the map.
 *
 * @param {object} map        Maplibre map instance.
 * @param {string} controlId  ID for the control.
 * @param {string} layerId    ID of the layer to toggle visibility for.
 * @param {string} leftLabel      Label text for the left side of the toggle. Default is "Toggle Layer".
 * @param {string} rightLabel     Label text for the right side of the toggle. Default is null.
 * @param {boolean} initialState Initial visibility state. Default is true.
 * @param {string} position   Position to place the control. Default is "top-right".
 * @param {object} widgetInstance Optional widget instance for ID generation.
 * @returns {void}
 */
function addVisibilityToggleControl(
  map,
  controlId,
  layerId,
  leftLabel = "Toggle Layer",
  rightLabel = "",
  initialState = true,
  position = "top-right",
  widgetInstance = null
) {
  // Generate proper namespaced ID if widgetInstance is available
  const finalControlId = widgetInstance
    ? `${controlId}-${widgetInstance.getId()}`
    : controlId;

  class VisibilityToggleControl {
    onAdd(mapInstance) {
      this._container = document.createElement("div");
      this._container.id = finalControlId;
      this._container.className =
        "toro-ctrl toro-toggle-container visibility-toggle-control";

      // Use shared HTML generator
      const mapId = widgetInstance ? widgetInstance.getId() : "standalone";
      const buttonHtml = generateToggleInputHtml(
        "visibility",
        layerId,
        leftLabel,
        rightLabel,
        initialState,
        mapId,
        false
      );
      this._container.innerHTML = buttonHtml;

      // Get reference to the toggle elements
      this._toggle = this._container.querySelector(".toro-toggle");
      this._checkbox = this._container.querySelector(".toro-toggle-checkbox");

      if (!this._toggle || !this._checkbox) {
        console.error("Visibility toggle elements not found!");
        return this._container;
      }

      // Listen for both checkbox change and label click events
      this._checkbox.addEventListener("change", () => {
        const newState = this._checkbox.checked;

        // Toggle layer visibility
        if (newState) {
          showLayer(mapInstance, layerId);
        } else {
          hideLayer(mapInstance, layerId);
        }

        // Update toggle state
        this._toggle.setAttribute("data-visible", newState.toString());
        this._checkbox.checked = newState;

        // Force visual update by managing CSS classes directly
        const switchElement = this._toggle.querySelector(".toro-toggle-switch");
        if (switchElement) {
          if (newState) {
            switchElement.classList.add("checked");
          } else {
            switchElement.classList.remove("checked");
          }
        }

        this._updateToggleState(newState);

        // Emit custom event for external listeners
        const event = new CustomEvent("visibility-toggle", {
          detail: { layerId: layerId, visible: newState },
        });
        this._container.dispatchEvent(event);
      });

      // Listen for clicks anywhere on the toggle (labels, switch, etc.)
      this._toggle.addEventListener("click", (e) => {
        // Only prevent default if we're not clicking the checkbox directly
        if (e.target !== this._checkbox) {
          e.preventDefault();
          // Manually toggle the checkbox
          this._checkbox.checked = !this._checkbox.checked;
          // Trigger the change event
          this._checkbox.dispatchEvent(new Event("change"));
        }
        // If clicking checkbox directly, let it handle naturally
      });

      return this._container;
    }

    onRemove() {
      this._container.parentNode.removeChild(this._container);
    }

    _updateToggleState(visible) {
      this._toggle.classList.toggle("active", visible);
    }
  }

  map.addControl(new VisibilityToggleControl(), position);
}

/**
 * Add a cluster toggle control to a control panel.
 *
 * @param {object} widgetInstance Widget instance.
 * @param {string} panelId        ID of the control panel.
 * @param {object} options        Control options including layerId, leftLabel, rightLabel, initialState.
 * @param {string} sectionTitle   Section title for the control.
 * @returns {void}
 */
function addClusterToggleControlToPanel(
  widgetInstance,
  panelId,
  options,
  sectionTitle
) {
  const map = widgetInstance.getMap();
  const panel = map._controlPanels && map._controlPanels[panelId];

  if (!panel) {
    console.warn(`Control panel with ID ${panelId} not found`);
    return;
  }

  const controlId = `cluster-toggle-${
    options.layerId
  }-${widgetInstance.getId()}`;
  const leftLabel = options.leftLabel || "";
  const rightLabel = options.rightLabel || "";
  const initialState =
    options.initialState !== undefined ? options.initialState : false;

  // Use shared HTML generator with inline handler and wrapper for panels
  const htmlContent = generateToggleInputHtml(
    "cluster",
    options.layerId,
    leftLabel,
    rightLabel,
    initialState,
    widgetInstance.getId(),
    true, // Use inline onclick handler for panels
    true // Include wrapper div with control classes
  );

  // Add to panel (include groupId from options)
  const groupId = options.groupId || null;
  panel.addControl(
    htmlContent,
    controlId,
    sectionTitle,
    "toro-cluster-toggle-panel-control",
    groupId
  );
}

/**
 * Add a visibility toggle control to a control panel.
 *
 * @param {object} widgetInstance Widget instance.
 * @param {string} panelId        ID of the control panel.
 * @param {object} options        Control options including layerId, leftLabel, rightLabel, initialState.
 * @param {string} sectionTitle   Section title for the control.
 * @returns {void}
 */
function addVisibilityToggleControlToPanel(
  widgetInstance,
  panelId,
  options,
  sectionTitle
) {
  const map = widgetInstance.getMap();
  const panel = map._controlPanels && map._controlPanels[panelId];

  if (!panel) {
    console.warn(`Control panel with ID ${panelId} not found`);
    return;
  }

  const controlId = `visibility-toggle-${
    options.layerId
  }-${widgetInstance.getId()}`;
  const leftLabel = options.leftLabel || "";
  const rightLabel = options.rightLabel || "";
  const initialState =
    options.initialState !== undefined ? options.initialState : true;

  // Use shared HTML generator with inline handler and wrapper for panels
  const htmlContent = generateToggleInputHtml(
    "visibility",
    options.layerId,
    leftLabel,
    rightLabel,
    initialState,
    widgetInstance.getId(),
    true, // Use inline onclick handler for panels
    true // Include wrapper div with control classes
  );

  // Add to panel
  const groupId = options.groupId || null;
  panel.addControl(htmlContent, controlId, sectionTitle, null, groupId);
}

/**
 * Add a control group to a control panel.
 * Creates a collapsible section that can contain multiple controls.
 *
 * @param {HTMLElement} el - The widget element.
 * @param {string} panelId - ID of the control panel.
 * @param {object} groupConfig - Group configuration options.
 * @returns {void}
 */
function addControlGroup(el, panelId, groupConfig) {
  const widgetInstance = el.widgetInstance;
  const map = widgetInstance.getMap();
  const panel = map._controlPanels && map._controlPanels[panelId];

  if (!panel) {
    console.warn(`Control panel with ID ${panelId} not found`);
    return;
  }

  const groupId = groupConfig.groupId;
  const groupTitle = groupConfig.groupTitle || "Control Group";
  const collapsible = groupConfig.collapsible !== false;
  const collapsed = groupConfig.collapsed === true;

  // Create the group HTML structure
  const groupHTML = `
    <div class="control-group ${collapsed ? "collapsed" : ""}" id="${groupId}">
      <div class="control-group-header ${collapsible ? "collapsible" : ""}" ${
    collapsible ? "onclick=\"toggleControlGroup('" + groupId + "')\"" : ""
  }>
        <span class="control-group-title">${groupTitle}</span>
        ${
          collapsible
            ? '<span class="control-group-toggle">' +
              (collapsed ? "▶" : "▼") +
              "</span>"
            : ""
        }
      </div>
      <div class="control-group-content ${collapsed ? "hidden" : ""}">
        <!-- Controls will be added here -->
      </div>
    </div>
  `;

  // Use the panel's addControl method
  panel.addControl(groupHTML, groupId, null, "control-group-container");
}

/**
 * Remove a control group from a control panel.
 *
 * @param {HTMLElement} el - The widget element.
 * @param {string} panelId - ID of the control panel.
 * @param {string} groupId - ID of the control group to remove.
 * @returns {void}
 */
function removeControlGroup(el, panelId, groupId) {
  const widgetInstance = el.widgetInstance;
  const map = widgetInstance.getMap();
  const panel = map._controlPanels && map._controlPanels[panelId];

  if (!panel) {
    console.warn(`Control panel with ID ${panelId} not found`);
    return;
  }

  // Use the panel's removeControl method
  panel.removeControl(groupId);
}

/**
 * Toggle the collapsed state of a control group.
 * This function is called when the group header is clicked (if collapsible).
 *
 * @param {string} groupId - ID of the control group to toggle.
 * @returns {void}
 */
function toggleControlGroup(groupId) {
  const groupElement = document.getElementById(groupId);
  if (!groupElement) return;

  const isCollapsed = groupElement.classList.contains("collapsed");
  const contentElement = groupElement.querySelector(".control-group-content");
  const toggleElement = groupElement.querySelector(".control-group-toggle");

  if (isCollapsed) {
    // Expand the group
    groupElement.classList.remove("collapsed");
    contentElement.classList.remove("hidden");
    if (toggleElement) toggleElement.textContent = "▼";
  } else {
    // Collapse the group
    groupElement.classList.add("collapsed");
    contentElement.classList.add("hidden");
    if (toggleElement) toggleElement.textContent = "▶";
  }
}

/**
 * Add a layer selector control to manage layer visibility.
 * Only the selected layer is visible, all others are hidden.
 *
 * @param {object} widgetInstance   Toro widget object.
 * @param {function} onLayerChange  Callback function called when layer selection changes.
 *                                  Receives the selected layer ID as parameter.
 * @param {object} options          Options for the layer selector control.
 *                                  Can include:
 *                                    - layerIds: array - Array of layer IDs to manage
 *                                    - labels: object - Custom labels for layers
 *                                    - defaultLayer: string - Default selected layer
 *                                    - noneOption: boolean - Whether to include "None" option
 *                                    - noneLabel: string - Label for "None" option
 *                                    - position: string (default "top-right")
 *                                    - useControlPanel: boolean
 *                                    - panelId: string - Panel ID if using control panel
 *                                    - panelTitle: string - Section title for control panel
 *                                    - groupId: string - Group ID if using control group
 * @returns {void}
 */
function addLayerSelectorControl(widgetInstance, onLayerChange, options = {}) {
  const map = widgetInstance.getMap();
  const el = widgetInstance.getElement();

  // Set default options
  const layerIds = options.layerIds || [];
  const labels = options.labels || {};
  const defaultLayer = options.defaultLayer || null;
  const noneOption = options.noneOption || false;
  const noneLabel = options.noneLabel || "None";

  // Generate unique IDs using the map ID
  const layerSelectorId = `layer-selector-${widgetInstance.getId()}`;

  // Generate select options HTML
  let selectOptions = "";

  // Add "None" option if enabled
  if (noneOption) {
    const noneSelected = !defaultLayer ? "selected" : "";
    selectOptions += `<option value="" ${noneSelected}>${noneLabel}</option>`;
  }

  // Add layer options
  layerIds.forEach((layerId) => {
    const label = labels[layerId] || layerId;
    const selected = layerId === defaultLayer ? "selected" : "";
    selectOptions += `<option value="${layerId}" ${selected}>${label}</option>`;
  });

  // HTML for the control
  const html = `
    <div id="layer-selector-container-${widgetInstance.getId()}" class="layer-selector-container">
      <select id="${layerSelectorId}" class="layer-selector">
        ${selectOptions}
      </select>
    </div>
    <style>
      .layer-selector-container {
        margin-bottom: 10px;
      }
      
      .layer-selector-title {
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 5px;
        color: #333;
      }
      
      .layer-selector {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: white;
        font-size: 13px;
        cursor: pointer;
        outline: none;
      }
      
      .layer-selector:focus {
        border-color: #007cba;
        box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.2);
      }
      
      .layer-selector:hover {
        border-color: #999;
      }
      
      .layer-selector-container.disabled {
        opacity: 0.4;
        pointer-events: none;
      }
      
      .layer-selector-container.disabled .layer-selector {
        background-color: #f5f5f5;
        cursor: not-allowed;
      }
    </style>
  `;

  // Add the control to the map or control panel
  const useControlPanel = options.useControlPanel || false;
  const panelId = options.panelId;
  const selectControlId = `layer-selector-control-${widgetInstance.getId()}`;

  if (
    useControlPanel &&
    panelId &&
    map._controlPanels &&
    map._controlPanels[panelId]
  ) {
    // Add to existing control panel
    const groupId = options.groupId || null;
    addHtmlToPanel(
      widgetInstance,
      panelId,
      html,
      options.panelTitle,
      null,
      groupId
    );
  } else {
    // Add as standalone control
    addCustomControl(
      map,
      selectControlId,
      html,
      options.position || "top-right"
    );
  }

  // Ensure the control is clickable by setting pointer events
  setTimeout(() => {
    const layerSelectorControl = document.getElementById(selectControlId);
    if (layerSelectorControl) {
      layerSelectorControl.style.pointerEvents = "auto";
      layerSelectorControl.style.zIndex = "1000";

      // Set pointer events on all child elements
      const allElements = layerSelectorControl.querySelectorAll("*");
      allElements.forEach((el) => {
        el.style.pointerEvents = "auto";
      });
    }
  }, 100);

  // Setup event handlers with retry mechanism
  let currentLayer = defaultLayer || (noneOption ? "" : layerIds[0]);
  let handleLayerChange;

  // Define layer change handler function
  handleLayerChange = function (e) {
    e.preventDefault();
    e.stopPropagation();

    const selectedLayer = this.value;
    const previousLayer = currentLayer;
    currentLayer = selectedLayer;

    // Hide all layers first
    layerIds.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", "none");
      }
    });

    // Show the selected layer (if any)
    if (selectedLayer && map.getLayer(selectedLayer)) {
      map.setLayoutProperty(selectedLayer, "visibility", "visible");
    }

    // Call the callback with the selected layer
    if (typeof onLayerChange === "function") {
      onLayerChange(selectedLayer, previousLayer);
    }

    // Trigger Shiny event if in Shiny mode
    if (HTMLWidgets.shinyMode) {
      Shiny.setInputValue(
        el.id + "_layer_selected",
        {
          selected: selectedLayer,
          previous: previousLayer,
          timestamp: new Date().getTime(),
        },
        {
          priority: "event",
        }
      );
    }
  };

  function setupEventHandlers() {
    const layerSelector = document.getElementById(layerSelectorId);
    if (!layerSelector) {
      console.warn("Layer selector control not found, retrying...");
      setTimeout(setupEventHandlers, 50);
      return;
    }

    // Check if layer selector should be disabled (no layer change callback provided)
    const isLayerSelectorDisabled = typeof onLayerChange !== "function";

    if (isLayerSelectorDisabled) {
      // Disable layer selector when no callback is connected
      const layerSelectorContainer = layerSelector.closest(
        ".layer-selector-container"
      );
      if (layerSelectorContainer) {
        layerSelectorContainer.classList.add("disabled");
      }

      layerSelector.disabled = true;
      layerSelector.title = "Layer switching is not available";

      // Don't add interactive event handlers when disabled
      return;
    }

    // Add change handler to layer selector
    layerSelector.addEventListener("change", handleLayerChange);

    layerSelector.addEventListener("mousedown", function (e) {
      e.stopPropagation();
    });

    // Set initial layer visibility based on default selection
    if (currentLayer) {
      // Hide all layers first
      layerIds.forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, "visibility", "none");
        }
      });

      // Show the default selected layer
      if (map.getLayer(currentLayer)) {
        map.setLayoutProperty(currentLayer, "visibility", "visible");
      }
    } else if (noneOption) {
      // Hide all layers if "None" is selected by default
      layerIds.forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, "visibility", "none");
        }
      });
    }
  }

  setupEventHandlers();

  // Store reference for external access
  map._layerSelectorControl = {
    layerIds: layerIds,
    labels: labels,
    noneOption: noneOption,
    getCurrentLayer: function () {
      return currentLayer;
    },
    setLayer: function (layerId) {
      if (layerIds.includes(layerId) || (noneOption && layerId === "")) {
        const previousLayer = currentLayer;
        currentLayer = layerId;

        // Update selector value
        const layerSelector = document.getElementById(layerSelectorId);
        if (layerSelector) {
          layerSelector.value = layerId;
        }

        // Update layer visibility
        layerIds.forEach((id) => {
          if (map.getLayer(id)) {
            map.setLayoutProperty(id, "visibility", "none");
          }
        });

        if (layerId && map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, "visibility", "visible");
        }

        if (typeof onLayerChange === "function") {
          onLayerChange(currentLayer, previousLayer);
        }
      }
    },
    enable: function (newOnLayerChange) {
      // Enable the layer selector control and set up event handlers
      const layerSelector = document.getElementById(layerSelectorId);
      if (layerSelector) {
        // Remove disabled class and enable control
        const layerSelectorContainer = layerSelector.closest(
          ".layer-selector-container"
        );
        if (layerSelectorContainer) {
          layerSelectorContainer.classList.remove("disabled");
        }

        layerSelector.disabled = false;
        layerSelector.title = "";

        // Update callback
        onLayerChange = newOnLayerChange;

        // Remove existing event listener to avoid duplicates
        layerSelector.removeEventListener("change", handleLayerChange);

        // Set up event handler with new callback
        if (typeof onLayerChange === "function") {
          layerSelector.addEventListener("change", handleLayerChange);
        }

        this.isDisabled = false;
      }
    },
    disable: function () {
      // Disable the layer selector control
      const layerSelector = document.getElementById(layerSelectorId);
      if (layerSelector) {
        // Add disabled class
        const layerSelectorContainer = layerSelector.closest(
          ".layer-selector-container"
        );
        if (layerSelectorContainer) {
          layerSelectorContainer.classList.add("disabled");
        }

        layerSelector.disabled = true;
        layerSelector.title = "Layer switching is not available";

        this.isDisabled = true;
      }
    },
    isDisabled: typeof onLayerChange !== "function",
  };
}

/**
 * Add layer selector control to a control panel
 *
 * @param {object} widgetInstance   Toro widget object.
 * @param {string} panelId          ID of the target control panel.
 * @param {object} options          Configuration for the layer selector control.
 * @param {string} sectionTitle     Optional section title for the control.
 * @returns {void}
 */
function addLayerSelectorControlToPanel(
  widgetInstance,
  panelId,
  options,
  sectionTitle
) {
  const map = widgetInstance.getMap();
  const panel = map._controlPanels && map._controlPanels[panelId];

  if (!panel) return;

  // Use the existing layer selector control logic
  const layerSelectorOptions = {
    ...options,
    useControlPanel: true,
    panelId: panelId,
    panelTitle: sectionTitle,
    groupId: options.groupId,
  };

  // Create the layer change callback
  const layerChangeCallback = function (selectedLayer, previousLayer) {
    // Layer visibility is already managed by the control itself
    // console.log(
    //   `Layer changed from "${previousLayer || "none"}" to "${
    //     selectedLayer || "none"
    //   }"`
    // );
  };

  // Add the layer selector control
  addLayerSelectorControl(
    widgetInstance,
    layerChangeCallback,
    layerSelectorOptions
  );
}
