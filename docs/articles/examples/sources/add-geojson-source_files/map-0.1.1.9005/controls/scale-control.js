/**
 * ToroScaleControl
 *
 * Wraps MapLibre's native ScaleControl so it can be tracked and managed
 * (add/remove/update by ID) consistently with toro's other controls.
 */
class ToroScaleControl {
  constructor(widgetInstance, options = {}) {
    this._widgetInstance = widgetInstance;
    this._options = options;
    this._id = options.id || 'scale-control';
    this._scale = new maplibregl.ScaleControl({
      maxWidth: options.maxWidth || 80,
      unit: options.unit || 'metric',
    });
  }

  onAdd(map) {
    this._map = map;
    this._container = this._scale.onAdd(map);
    this._container.id = this._id;
    return this._container;
  }

  onRemove() {
    this._scale.onRemove();
    this._map = undefined;
  }

  setUnit(unit) {
    this._scale.setUnit(unit);
  }

  setVisible(show) {
    if (this._container) {
      this._container.style.display = show ? 'block' : 'none';
      this._container.style.pointerEvents = show ? 'auto' : 'none';
    }
  }
}

/**
 * Add a scale control to the map.
 *
 * @param {object} el Widget element containing the map instance.
 * @param {object} options Options for the scale control (id, maxWidth, unit, position).
 * @returns {void}
 */
function addScaleControl(el, options = {}) {
  const map = el.mapInstance;
  const controlId = options.id || 'scale-control';

  if (!map._toroControls) map._toroControls = {};

  // Replace any existing control with the same ID
  if (map._toroControls[controlId]) {
    map.removeControl(map._toroControls[controlId]);
    delete map._toroControls[controlId];
  }

  const control = new ToroScaleControl(el.widgetInstance, options);
  map.addControl(control, options.position || 'bottom-left');
  map._toroControls[controlId] = control;
}

/**
 * Add a scale control into an existing control panel.
 *
 * @param {object} el Widget element containing the map instance.
 * @param {string} panelId ID of the target panel.
 * @param {object} [options={}] Options for the scale control (id, sectionTitle, groupId, ...).
 * @returns {void}
 */
function addScaleControlToPanel(el, panelId, options = {}) {
  const map = el.mapInstance;
  const panel = map._controlPanels && map._controlPanels[panelId];

  if (!panel) {
    console.warn('Control panel with ID ' + panelId + ' not found.');
    return;
  }

  const controlId = options.id || 'scale-control';

  if (!map._toroControls) map._toroControls = {};

  // Replace any existing control with the same ID
  if (map._toroControls[controlId]) {
    removeScaleControl(el, controlId);
  }

  const control = new ToroScaleControl(el.widgetInstance, options);
  const node = control.onAdd(map);
  control._panelId = panelId;

  panel.mountElement(
    node,
    controlId,
    options.sectionTitle || null,
    'toro-scale-panel-control',
    options.groupId || null
  );

  map._toroControls[controlId] = control;
}

/**
 * Remove a scale control from the map.
 *
 * @param {object} el Widget element containing the map instance.
 * @param {string} controlId ID of the scale control to remove.
 * @returns {void}
 */
function removeScaleControl(el, controlId) {
  const map = el.mapInstance;
  const control = map._toroControls && map._toroControls[controlId];
  if (!control) return;

  if (control._panelId) {
    const panel = map._controlPanels && map._controlPanels[control._panelId];
    if (panel && typeof panel.removeControl === 'function') {
      panel.removeControl(controlId);
    }
    if (typeof control.onRemove === 'function') {
      control.onRemove();
    }
  } else {
    map.removeControl(control);
  }

  delete map._toroControls[controlId];
}

/**
 * Show or hide a scale control on the map.
 *
 * @param {object} el Widget element containing the map instance.
 * @param {string} controlId ID of the scale control to toggle.
 * @param {boolean} show Whether to show or hide the control.
 * @returns {void}
 */
function toggleScaleControl(el, controlId, show) {
  const map = el.mapInstance;
  const control = map._toroControls && map._toroControls[controlId];
  if (control && typeof control.setVisible === 'function') {
    control.setVisible(show);
  } else {
    console.warn(`Scale control with ID ${controlId} not found.`);
  }
}

/**
 * Update the unit of an existing scale control.
 *
 * @param {object} el Widget element containing the map instance.
 * @param {string} controlId ID of the scale control to update.
 * @param {string} unit The unit to switch to ("metric", "imperial", or "nautical").
 * @returns {void}
 */
function setScaleControlUnit(el, controlId, unit) {
  const map = el.mapInstance;
  const control = map._toroControls && map._toroControls[controlId];
  if (control && typeof control.setUnit === 'function') {
    control.setUnit(unit);
  }
}

// Register with toro's plugin system (see toro's map.js) so scale controls
// configured at map-creation time are initialized once the map has loaded.
if (window.toro && typeof window.toro.registerPlugin === 'function') {
  window.toro.registerPlugin(function (el, x) {
    if (x.scaleControls) {
      Object.keys(x.scaleControls).forEach(function (controlId) {
        addScaleControl(el, x.scaleControls[controlId]);
      });
    }

    // Process scale controls nested inside control panels
    if (!x.controlPanels) return;

    Object.keys(x.controlPanels).forEach(function (panelId) {
      var panelConfig = x.controlPanels[panelId];
      var panelOptions = panelConfig.options || panelConfig;
      var panelControls = panelOptions.panelControls;

      if (!panelControls || !Array.isArray(panelControls)) return;

      panelControls.forEach(function (controlConfig) {
        if (controlConfig.type !== 'scale') return;

        var options = Object.assign({}, controlConfig.options || {}, {
          sectionTitle:
            controlConfig.title ||
            (controlConfig.options && controlConfig.options.sectionTitle) ||
            null,
          groupId:
            controlConfig.groupId ||
            (controlConfig.options && controlConfig.options.groupId) ||
            null,
        });

        addScaleControlToPanel(el, panelId, options);
      });
    });
  });
}

// Shiny proxy support
if (HTMLWidgets.shinyMode) {
  Shiny.addCustomMessageHandler('addScaleControl', function (message) {
    withMapInstance(message.id, function (el) {
      addScaleControl(el, message.options);
    });
  });

  Shiny.addCustomMessageHandler('removeScaleControl', function (message) {
    withMapInstance(message.id, function (el) {
      removeScaleControl(el, message.controlId);
    });
  });

  Shiny.addCustomMessageHandler('toggleScaleControl', function (message) {
    withMapInstance(message.id, function (el) {
      toggleScaleControl(el, message.controlId, message.show);
    });
  });

  Shiny.addCustomMessageHandler('setScaleControlUnit', function (message) {
    withMapInstance(message.id, function (el) {
      setScaleControlUnit(el, message.controlId, message.unit);
    });
  });
}
