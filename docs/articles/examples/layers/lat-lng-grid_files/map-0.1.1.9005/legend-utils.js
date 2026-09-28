/**
 * Remove the legend control associated with a specific layer, if it exists.
 *
 * The legends are stored in a custom property `_toroLegendStore` on the Mapbox GL JS map instance,
 * which keeps track of both the configurations and the control instances for each layer.
 * This function checks if a legend control exists for the specified layer ID, removes it from the
 * map, and cleans up the associated state in the legend store.
 *
 * @param {Object} widgetInstance - The instance of the map widget.
 * @param {string} layerId - The ID of the layer whose legend should be removed.
 * @returns {void}
 */
function removeLegendForLayer(widgetInstance, layerId) {
  const map = widgetInstance.getMap();
  const store = map._toroLegendStore;
  if (!store || !store.controls || !store.controls[layerId]) {
    return;
  }

  const state = store.controls[layerId];
  if (state && state.control) {
    map.removeControl(state.control);
  }

  delete store.controls[layerId];
  delete store.configs[layerId];
}

/**
 * Add or update a legend control for a specific layer based on the provided configuration.
 *
 * This function stores the legend configuration in a custom property `_toroLegendStore` on the map
 * instance and ensures that a corresponding legend control is created and added to the map. It
 * attempts to derive legend entries from the layer's paint properties if no explicit values or
 * colours are provided in the configuration. The legend's visibility is synchronized with the
 * layer's visibility state.
 *
 * @param {Object} widgetInstance - The instance of the map widget.
 * @param {string} layerId - The ID of the layer for which the legend should be added or updated.
 * @param {Object|null} legendConfig - Optional configuration for the legend, including title,
 *   values, colours, position, and className. If null, the function will attempt to derive legend
 *   entries from the layer's paint properties.
 * @returns {void}
 */
function addLegendForLayer(widgetInstance, layerId, legendConfig = null) {
  const map = widgetInstance.getMap();
  const existingConfig = _getLegendConfig(map, layerId);

  if (legendConfig) {
    const mergedConfig = _mergeLegendConfig(
      existingConfig || {},
      _normalizeLegendConfig(layerId, legendConfig),
    );
    _setLegendConfig(map, layerId, mergedConfig);
  } else if (!existingConfig) {
    // Ignore paint-triggered refreshes for layers that were never configured with add_legend.
    return;
  }

  const activeConfig = _getLegendConfig(map, layerId);
  const targetLayer = map.getLayer(layerId);

  if (!targetLayer) {
    console.warn(`Layer not found for legend: ${layerId}`);
    return;
  }

  const layerType = targetLayer.type;
  const paintKey = _getLegendPaintKey(map, layerId, layerType);

  if (!paintKey) {
    console.warn(`No supported paint property found for legend on layer: ${layerId}`);
    return;
  }

  const paintValue = map.getPaintProperty(layerId, paintKey);
  const derivedEntries = _extractLegendEntriesFromPaint(paintValue);
  const entries = _resolveLegendEntries(derivedEntries, activeConfig);

  if (!entries.length) {
    console.warn(`Could not derive legend entries from layer paint: ${layerId}`);
    return;
  }

  const state = _ensureLegendControl(widgetInstance, layerId, activeConfig);
  _renderLegend(state, layerId, paintKey, entries, activeConfig);
  syncLegendVisibilityByMap(map, layerId);
}

/**
 * Check if a legend control exists for a specific layer.
 *
 * @param {Object} widgetInstance - The instance of the map widget.
 * @param {string} layerId - The ID of the layer to check for an associated legend.
 * @returns {boolean} True if a legend control exists for the specified layer, false otherwise.
 */
function hasLegendForLayer(widgetInstance, layerId) {
  const map = widgetInstance.getMap();
  return Boolean(_getLegendConfig(map, layerId));
}

/**
 * Ensure that the legend store is initialized on the map instance and return it.
 *
 * The legend store is used to keep track of legend configurations and controls associated with
 * different layers.
 *
 * @param {Object} map - The Mapbox GL JS map instance.
 * @returns {Object} The legend store object containing configurations and controls.
 */
function _ensureLegendStore(map) {
  if (!map._toroLegendStore) {
    map._toroLegendStore = {
      configs: {},
      controls: {},
    };
  }
  return map._toroLegendStore;
}

/**
 * Retrieve the legend configuration for a specific layer from the map's legend store.
 *
 * @param {Object} map - The Mapbox GL JS map instance.
 * @param {string} layerId - The ID of the layer whose legend configuration should be retrieved.
 * @returns {Object|null} The legend configuration object for the specified layer, or null if
 *   no configuration exists.
 */
function _getLegendConfig(map, layerId) {
  const store = _ensureLegendStore(map);
  return store.configs[layerId] || null;
}

/**
 * Store the legend configuration for a specific layer in the map's legend store.
 *
 * @param {Object} map - The Mapbox GL JS map instance.
 * @param {string} layerId - The ID of the layer for which the legend configuration should be
 *   stored.
 * @param {Object} config - The legend configuration object to store for the specified layer.
 * @returns {void}
 */
function _setLegendConfig(map, layerId, config) {
  const store = _ensureLegendStore(map);
  store.configs[layerId] = config;
}

/**
 * Normalize the incoming legend configuration
 *
 * Do this by applying defaults and ensuring consistent property
 * names. This function handles both the direct properties of the legend configuration and any
 * options that may be nested within an `options` object, allowing for flexible configuration
 * formats.
 *
 * @param {string} layerId - The ID of the layer for which the legend configuration is being
 *   normalized.
 * @param {Object|null} legendConfig - The raw legend configuration object provided by the user.
 * @returns {Object} The normalized legend configuration with consistent property names and default
 *   values applied.
 */
function _normalizeLegendConfig(layerId, legendConfig) {
  const rawConfig = legendConfig || {};
  const rawOptions = rawConfig.options || {};

  return {
    layerId,
    title: rawConfig.title || null,
    values: Array.isArray(rawConfig.values) ? rawConfig.values : null,
    colours: Array.isArray(rawConfig.colours)
      ? rawConfig.colours
      : Array.isArray(rawConfig.colors)
        ? rawConfig.colors
        : null,
    position: rawConfig.position || rawOptions.position || 'top-right',
    className:
      rawConfig.className ||
      rawConfig.class_name ||
      rawOptions.className ||
      rawOptions.class_name ||
      '',
    showMeta: _coalesceBoolean(
      rawConfig.showMeta,
      rawConfig.show_meta,
      rawOptions.showMeta,
      rawOptions.show_meta,
      false,
    ),
  };
}

/**
 * Coalesce multiple boolean values, returning the first one that is explicitly true or false. If
 * none of the values are boolean, return the last value as a fallback.
 *
 * @param {...*} values - A list of values to coalesce, where the function will return the first
 *   value that is explicitly a boolean (true or false). If no boolean values are found, the last
 *   value in the list will be returned as a fallback.
 * @returns {boolean|*} The first boolean value found in the input, or the last value if no
 *   booleans are present.
 */
function _coalesceBoolean(...values) {
  const fallback = values[values.length - 1];
  for (let i = 0; i < values.length - 1; i += 1) {
    if (typeof values[i] === 'boolean') {
      return values[i];
    }
  }
  return fallback;
}

/**
 * Merge the incoming legend configuration with the existing configuration for a layer, giving
 * precedence to the incoming configuration values. This allows for partial updates to the legend
 * configuration without overwriting unspecified properties.
 *
 * @param {Object} baseConfig - The existing legend configuration for the layer.
 * @param {Object} incomingConfig - The new legend configuration values to merge with the existing
 *   configuration.
 * @returns {Object} The merged legend configuration object, combining properties from both the
 *   existing and incoming configurations, with incoming values taking precedence.
 */
function _mergeLegendConfig(baseConfig, incomingConfig) {
  return {
    ...baseConfig,
    ...incomingConfig,
  };
}

/**
 * Ensure that a legend control exists for the specified layer and configuration, creating it if
 * necessary.
 *
 * If a control already exists but its position or className differs from the provided
 * configuration, the existing control will be removed and recreated with the new settings.
 *
 * The function generates unique IDs for the control and its sub-elements based on the widget
 * instance ID and layer ID, ensuring that multiple legends can coexist without conflicts. It
 * returns the state object containing references to the control and its associated element IDs,
 * which can be used for rendering and updating the legend content.
 *
 * @param {Object} widgetInstance - The instance of the map widget.
 * @param {string} layerId - The ID of the layer for which the legend control should be ensured.
 * @param {Object} legendConfig - The configuration object for the legend, including position and className.
 * @returns {Object} The state object containing references to the legend control and its element IDs.
 */
function _ensureLegendControl(widgetInstance, layerId, legendConfig) {
  const map = widgetInstance.getMap();
  const store = _ensureLegendStore(map);
  const controlId = `toro-legend-${widgetInstance.getId()}-${_slug(layerId)}`;
  const titleId = `${controlId}-title`;
  const itemsId = `${controlId}-items`;
  const metaId = `${controlId}-meta`;

  let state = store.controls[layerId];
  const requiresRecreate =
    state &&
    (state.position !== legendConfig.position || state.className !== legendConfig.className);

  if (requiresRecreate) {
    map.removeControl(state.control);
    delete store.controls[layerId];
    state = null;
  }

  if (!state) {
    const legendControl = {
      onAdd() {
        this._container = document.createElement('div');
        const container = this._container;
        container.className =
          `mapboxgl-ctrl toro-legend-control ${legendConfig.className || ''}`.trim();
        container.id = controlId;

        const legend = document.createElement('div');
        legend.className = 'toro-legend';

        const titleEl = document.createElement('div');
        titleEl.className = 'toro-legend-title';
        titleEl.id = titleId;

        const itemsEl = document.createElement('div');
        itemsEl.className = 'toro-legend-items';
        itemsEl.id = itemsId;

        const metaEl = document.createElement('div');
        metaEl.className = 'toro-legend-meta';
        metaEl.id = metaId;

        legend.appendChild(titleEl);
        legend.appendChild(itemsEl);
        legend.appendChild(metaEl);
        container.appendChild(legend);

        return container;
      },
      onRemove() {
        if (this._container && this._container.parentNode) {
          this._container.parentNode.removeChild(this._container);
        }
      },
    };

    map.addControl(legendControl, legendConfig.position || 'top-right');

    state = {
      control: legendControl,
      controlId,
      titleId,
      itemsId,
      metaId,
      position: legendConfig.position || 'top-right',
      className: legendConfig.className || '',
    };
    store.controls[layerId] = state;
  }

  return state;
}

/**
 * Render the legend content for a specific layer based on the provided entries and configuration.
 *
 * @param {Object} state - The state object containing references to the legend control and its
 *   element IDs.
 * @param {string} layerId - The ID of the layer for which the legend is being rendered.
 * @param {string} paintKey - The paint property key from which the legend entries were derived.
 * @param {Array} entries - An array of legend entries, each containing a label and color.
 * @param {Object} legendConfig - The configuration object for the legend, including title and
 *   showMeta.
 * @returns {void}
 */
function _renderLegend(state, layerId, paintKey, entries, legendConfig) {
  const titleEl = document.getElementById(state.titleId);
  const itemsEl = document.getElementById(state.itemsId);
  const metaEl = document.getElementById(state.metaId);

  if (!titleEl || !itemsEl || !metaEl) {
    return;
  }

  titleEl.textContent = legendConfig.title || layerId;
  metaEl.textContent = paintKey;
  metaEl.style.display = legendConfig.showMeta === true ? 'block' : 'none';

  itemsEl.innerHTML = entries
    .map((entry) => {
      const label = _escapeHtml(entry.label);
      const color = _escapeHtml(entry.color);
      return `
        <div class="toro-legend-item">
          <span class="toro-legend-swatch" style="background:${color}"></span>
          <span class="toro-legend-label">${label}</span>
        </div>
      `;
    })
    .join('');
}

/**
 * Synchronize the visibility of the legend for a specific layer based on the layer's visibility.
 *
 * @param {Object} map - The map instance containing the layer.
 * @param {string} layerId - The ID of the layer for which the legend visibility should be
 *   synchronized.
 * @returns {void}
 */
function syncLegendVisibilityByMap(map, layerId) {
  const store = map._toroLegendStore;
  if (!store || !store.controls || !store.controls[layerId]) {
    return;
  }

  const state = store.controls[layerId];
  const controlEl = document.getElementById(state.controlId);
  if (!controlEl) {
    return;
  }

  const isVisible = _isLayerVisible(map, layerId);
  controlEl.style.display = isVisible ? '' : 'none';
}

/**
 * Synchronize the visibility of all legend controls with their corresponding layer visibility
 * states.
 *
 * This function iterates through all legend controls stored in the map's legend store and updates
 * their visibility based on the current visibility of their associated layers. It ensures that
 * legends are hidden when their layers are not visible and shown when their layers are visible.
 *
 * @param {Object} map - The map instance containing the layers and legend controls.
 * @returns {void}
 */
function syncAllLegendVisibility(map) {
  const store = map._toroLegendStore;
  if (!store || !store.controls) {
    return;
  }

  Object.keys(store.controls).forEach((layerId) => {
    syncLegendVisibilityByMap(map, layerId);
  });
}

/**
 * Check if a specific layer is currently visible on the map.
 *
 * This function checks the visibility of a layer by retrieving its layout property and determining
 * if it is set to 'none' (hidden) or not. If the layer does not exist on the map, it is treated as
 * not visible.
 *
 * @param {Object} map - The map instance containing the layer.
 * @param {string} layerId - The ID of the layer to check for visibility.
 * @returns {boolean} True if the layer is visible, false if it is hidden or does not exist.
 */
function _isLayerVisible(map, layerId) {
  if (!map.getLayer(layerId)) {
    return false;
  }

  const visibility = map.getLayoutProperty(layerId, 'visibility');
  return visibility !== 'none';
}

/**
 * Resolve the legend entries based on the derived entries and the legend configuration.
 *
 * This function takes the derived legend entries and applies any customizations specified in the
 * legend configuration, such as custom colors or labels. It ensures that the legend entries
 * reflect the desired appearance and labeling.
 *
 * @param {Array} derivedEntries - The automatically derived legend entries.
 * @param {Object} legendConfig - The legend configuration object.
 * @returns {Array} The resolved legend entries.
 */
function _resolveLegendEntries(derivedEntries, legendConfig) {
  if (!legendConfig) {
    return derivedEntries;
  }

  const configColours = Array.isArray(legendConfig.colours) ? legendConfig.colours : null;
  const configValues = Array.isArray(legendConfig.values) ? legendConfig.values : null;

  if (configColours && configColours.length > 0) {
    return configColours.map((color, index) => ({
      label: String(configValues?.[index] ?? derivedEntries[index]?.label ?? `Item ${index + 1}`),
      color,
    }));
  }

  if (configValues && configValues.length > 0) {
    return derivedEntries.map((entry, index) => ({
      label: String(configValues[index] ?? entry.label),
      color: entry.color,
    }));
  }

  return derivedEntries;
}

/**
 * Get the appropriate paint property key for a legend based on the layer type.
 *
 * This function determines the most suitable paint property key to use for generating legend
 * entries based on the type of the layer. It prioritizes certain keys for each layer type.
 *
 * @param {Object} map - The map instance containing the layer.
 * @param {string} layerId - The ID of the layer.
 * @param {string} layerType - The type of the layer (e.g., 'fill', 'line', 'circle').
 * @returns {string|null} The paint property key to use for the legend, or null if none found.
 */
function _getLegendPaintKey(map, layerId, layerType) {
  const preferredKeysByType = {
    fill: ['fill-color'],
    line: ['line-color'],
    circle: ['circle-color'],
    symbol: ['icon-color', 'text-color'],
    heatmap: ['heatmap-color'],
    background: ['background-color'],
  };

  const preferredKeys = preferredKeysByType[layerType] || [];
  for (let i = 0; i < preferredKeys.length; i += 1) {
    const key = preferredKeys[i];
    const value = map.getPaintProperty(layerId, key);
    if (value !== undefined && value !== null) {
      return key;
    }
  }

  return null;
}

/**
 * Extract legend entries from a paint property value.
 *
 * This function interprets the paint property value and generates corresponding legend entries.
 *
 * @param {any} paintValue - The paint property value.
 * @returns {Array} The extracted legend entries.
 */
function _extractLegendEntriesFromPaint(paintValue) {
  if (paintValue === undefined || paintValue === null) {
    return [];
  }

  if (typeof paintValue === 'string') {
    return [{ label: 'Value', color: paintValue }];
  }

  if (!Array.isArray(paintValue) || paintValue.length === 0) {
    return [];
  }

  const op = paintValue[0];

  if (op === 'match') {
    return _extractMatchEntries(paintValue);
  }

  if (op === 'step') {
    return _extractStepEntries(paintValue);
  }

  if (op === 'interpolate') {
    return _extractInterpolateEntries(paintValue);
  }

  if (op === 'case') {
    return _extractCaseEntries(paintValue);
  }

  return [];
}

/**
 * Extract legend entries from a 'match' expression.
 *
 * A 'match' expression has the format:
 * ['match', input, match1, output1, match2, output2, ..., fallback]
 * This function extracts the match-output pairs as legend entries and includes the fallback as an
 * "Other" category if it is a valid color.
 *
 * @param {Array} expression - The 'match' expression array.
 * @returns {Array} The extracted legend entries from the 'match' expression.
 */
function _extractMatchEntries(expression) {
  const entries = [];

  for (let i = 2; i < expression.length - 1; i += 2) {
    const rawLabel = expression[i];
    const color = expression[i + 1];
    if (_isColorValue(color)) {
      entries.push({ label: String(rawLabel), color });
    }
  }

  const fallback = expression[expression.length - 1];
  if (_isColorValue(fallback)) {
    entries.push({ label: 'Other', color: fallback });
  }

  return entries;
}

/**
 * Extract legend entries from a 'step' expression.
 *
 * A 'step' expression has the format:
 * ['step', input, base, stop1, output1, stop2, output2, ..., stopN, outputN]
 * This function extracts the step intervals and their corresponding colors as legend entries.
 *
 * @param {Array} expression - The 'step' expression array.
 * @returns {Array} The extracted legend entries from the 'step' expression.
 */
function _extractStepEntries(expression) {
  const entries = [];
  if (expression.length < 4) {
    return entries;
  }

  const firstStop = expression[3];
  const baseColor = expression[2];
  if (_isColorValue(baseColor)) {
    entries.push({ label: `< ${String(firstStop)}`, color: baseColor });
  }

  for (let i = 3; i < expression.length; i += 2) {
    const stop = expression[i];
    const color = expression[i + 1];
    if (!_isColorValue(color)) {
      continue;
    }

    const nextStop = i + 2 < expression.length ? expression[i + 2] : null;
    const label =
      nextStop === null ? `>= ${String(stop)}` : `${String(stop)} - ${String(nextStop)}`;
    entries.push({ label, color });
  }

  return entries;
}

/**
 * Extract legend entries from an 'interpolate' expression.
 *
 * An 'interpolate' expression has the format:
 * ['interpolate', interpolation, input, stop1, output1, stop2, output2, ..., stopN, outputN]
 * This function extracts the interpolation stops and their corresponding colors as legend entries.
 *
 * @param {Array} expression - The 'interpolate' expression array.
 * @returns {Array} The extracted legend entries from the 'interpolate' expression.
 */
function _extractInterpolateEntries(expression) {
  const entries = [];
  if (expression.length < 6) {
    return entries;
  }

  for (let i = 3; i < expression.length; i += 2) {
    const stop = expression[i];
    const color = expression[i + 1];
    if (_isColorValue(color)) {
      entries.push({ label: String(stop), color });
    }
  }

  return entries;
}

/**
 * Extract legend entries from a 'case' expression.
 *
 * A 'case' expression has the format:
 * ['case', condition1, output1, condition2, output2, ..., fallback]
 * This function extracts the condition-output pairs as legend entries and includes the fallback as
 * a "Default" category if it is a valid color.
 *
 * @param {Array} expression - The 'case' expression array.
 * @returns {Array} The extracted legend entries from the 'case' expression.
 */
function _extractCaseEntries(expression) {
  const entries = [];
  let ruleIndex = 1;

  for (let i = 1; i < expression.length - 1; i += 2) {
    const color = expression[i + 1];
    if (_isColorValue(color)) {
      entries.push({ label: `Rule ${ruleIndex}`, color });
      ruleIndex += 1;
    }
  }

  const fallback = expression[expression.length - 1];
  if (_isColorValue(fallback)) {
    entries.push({ label: 'Default', color: fallback });
  }

  return entries;
}

/**
 * Check if a value is a valid color string for use in legend entries.
 *
 * @param {any} value - The value to check for being a valid color string.
 * @returns {boolean} True if the value is a non-empty string, false otherwise.
 */
function _isColorValue(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Escape special HTML characters in a string to prevent XSS vulnerabilities when rendering legend
 * labels.
 *
 * @param {any} value - The value to escape, which will be converted to a string if it is not
 *   already.
 * @returns {string} The escaped string with special HTML characters replaced by their corresponding
 *   HTML entities.
 */
function _escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Convert a string value into a slug format suitable for use in HTML element IDs or class names by
 * replacing non-alphanumeric characters with hyphens.
 *
 * @param {any} value - The value to convert into a slug, which will be converted to a string if it
 *   is not already.
 * @returns {string} The slugified string with non-alphanumeric characters replaced by hyphens.
 */
function _slug(value) {
  return String(value).replaceAll(/[^a-zA-Z0-9_-]/g, '-');
}
