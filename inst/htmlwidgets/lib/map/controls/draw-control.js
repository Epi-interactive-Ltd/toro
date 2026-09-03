const validDrawModes = ['polygon', 'delete', 'line', 'point', 'circle', 'freehand']; // Accepted draw modes

const _DEFAULT_ACTIVE_COLOUR = '#04AAC1';
const _DEFAULT_INACTIVE_COLOUR = '#04AAC1';
const _DEFAULT_LINE_WIDTH = 2;
const _DEFAULT_OPACITY = 0.9;
const _DEFAULT_OUTLINE_OPACITY = 1;
const _DEFAULT_FILL_OPACITY = 0.3;
const _DEFAULT_POINT_WIDTH = 2;
const _DEFAULT_POINT_OUTLINE_WIDTH = 3;
const _DEFAULT_MIDPOINT_WIDTH = 2;
const _DEFAULT_MIDPOINT_OUTLINE_WIDTH = 1;

function _getDefaultStyling(
  canEdit = false,
  activeColour = _DEFAULT_ACTIVE_COLOUR,
  inactiveColour = _DEFAULT_INACTIVE_COLOUR,
) {
  // return {};
  const selectedPointOpacity = canEdit ? _DEFAULT_OPACITY : 0;
  return {
    // Circle, Polygon, Rectangle, Angled rectangle, Sector, Sensor, and Freehand
    fillColor: inactiveColour,
    fillOpacity: _DEFAULT_FILL_OPACITY,
    outlineColor: inactiveColour,
    outlineOpacity: _DEFAULT_OPACITY,
    outlineWidth: _DEFAULT_LINE_WIDTH,

    // Point specific
    pointColor: inactiveColour,
    pointOpacity: _DEFAULT_OPACITY,
    pointWidth: _DEFAULT_POINT_WIDTH,
    pointOutlineColor: inactiveColour,
    pointOutlineOpacity: _DEFAULT_OUTLINE_OPACITY,
    pointOutlineWidth: _DEFAULT_LINE_WIDTH,
    // Point selected specific styling
    selectedPointColor: activeColour,
    selectedPointOpacity: _DEFAULT_OPACITY,
    selectedPointWidth: _DEFAULT_POINT_WIDTH,
    selectedPointOutlineColor: activeColour,
    selectedPointOutlineOpacity: _DEFAULT_OUTLINE_OPACITY,
    selectedPointOutlineWidth: _DEFAULT_LINE_WIDTH,

    // Linestring, Polyline, and Freehand linestring
    lineStringColor: inactiveColour,
    lineStringOpacity: _DEFAULT_OPACITY,
    lineStringWidth: _DEFAULT_LINE_WIDTH,
    lineStringDash: [1, 0], // [dash, gap] - default is no gap
    // Line selected specific styling
    selectedLineStringColor: activeColour,
    selectedLineStringOpacity: _DEFAULT_OPACITY,
    selectedLineStringWidth: _DEFAULT_LINE_WIDTH,

    // Linestring, Polygon, Polyline, Freehand, and Freehand linestring
    closingPointColor: inactiveColour,
    closingPointWidth: 3,
    closingPointOutlineColor: inactiveColour,
    closingPointOutlineWidth: 2,

    // Sensor
    centerPointColor: activeColour,
    centerPointOpacity: _DEFAULT_OPACITY,
    centerPointWidth: 1,
    centerPointOutlineColor: activeColour,
    centerPointOutlineOpacity: _DEFAULT_OPACITY,
    centerPointOutlineWidth: 2,

    // Polyline
    polygonFillColor: inactiveColour,
    polygonFillOpacity: _DEFAULT_OPACITY,
    polygonOutlineColor: inactiveColour,
    polygonOutlineOpacity: _DEFAULT_OUTLINE_OPACITY,
    polygonOutlineWidth: _DEFAULT_LINE_WIDTH,
    closingPointOpacity: _DEFAULT_OPACITY,
    closingPointOutlineOpacity: _DEFAULT_OUTLINE_OPACITY,
    snappingPointColor: activeColour,
    snappingPointOpacity: _DEFAULT_OPACITY,
    snappingPointWidth: _DEFAULT_POINT_WIDTH,
    snappingPointOutlineColor: activeColour,
    snappingPointOutlineOpacity: _DEFAULT_OUTLINE_OPACITY,
    snappingPointOutlineWidth: _DEFAULT_LINE_WIDTH,
    // Polygon selected specific styling
    selectedPolygonColor: activeColour,
    selectedPolygonFillOpacity: _DEFAULT_FILL_OPACITY,
    selectedPolygonOutlineColor: activeColour,
    selectedPolygonOutlineOpacity: _DEFAULT_OUTLINE_OPACITY,
    selectedPolygonOutlineWidth: _DEFAULT_LINE_WIDTH,

    // Selection point styling
    // Lines and Polygons have selection points that allow you to move existing points in the geometry
    selectionPointColor: activeColour,
    selectionPointOpacity: selectedPointOpacity,
    selectionPointOutlineColor: activeColour,
    selectionPointOutlineOpacity: selectedPointOpacity,
    selectionPointWidth: canEdit ? _DEFAULT_POINT_WIDTH : 0,
    selectionPointOutlineWidth: canEdit ? _DEFAULT_POINT_OUTLINE_WIDTH : 0,

    // Mid points
    // Lines and Polygons have mid points that allow you to add new points to the geometry
    midPointColor: activeColour,
    midPointOpacity: selectedPointOpacity,
    midPointOutlineColor: activeColour,
    midPointOutlineOpacity: selectedPointOpacity,
    midPointWidth: canEdit ? _DEFAULT_MIDPOINT_WIDTH : 0,
    midPointOutlineWidth: canEdit ? _DEFAULT_MIDPOINT_OUTLINE_WIDTH : 0,
  };
}

/**
 * By default no editing available.
 *
 * See: https://github.com/JamesLMilner/terra-draw/blob/main/guides/4.MODES.md#drawing-modes
 * for current touch draw support.
 * "There are varying degrees of support for touch devices. Currently on touch devices Select,
 * Point, Line and Polygon Modes are fully supported. Circle, Rectangle and Angled Rectangle Modes
 * work with the caveat with the UX is not ideal. Freehand is not currently supported."
 */
function _getSelectConfig(allowModify = false) {
  return {
    // allowManualDeselection: false,
    allowManualSelection: true,
    flags: {
      point: {
        feature: {
          draggable: allowModify,
        },
      },

      polygon: {
        feature: {
          draggable: allowModify,
          coordinates: {
            midpoints: {
              draggable: allowModify,
            },
            draggable: allowModify,
            deletable: true,
          },
        },
      },

      linestring: {
        feature: {
          draggable: allowModify,
          coordinates: {
            midpoints: {
              draggable: allowModify,
            },
            draggable: allowModify,
            deletable: true,
          },
        },
      },

      freehand: {
        feature: {
          draggable: allowModify,
          coordinates: {
            midpoints: {
              draggable: allowModify,
            },
            draggable: allowModify,
            deletable: true,
          },
        },
      },

      circle: {
        feature: {
          draggable: allowModify,
          coordinates: {
            // midpoints: false,
            midpoints: {
              draggable: allowModify,
            },
            coordinates: {
              resizable: 'center',
            },
            draggable: allowModify,
            deletable: true,
          },
        },
      },

      rectangle: {
        feature: {
          draggable: allowModify,
          coordinates: {
            midpoints: {
              draggable: allowModify,
            },
            draggable: allowModify,
            deletable: true,
          },
        },
      },
    },
  };
}

function _getConfigValue(key, configOptions, defaultConfig, alternativeSpelling) {
  return (
    configOptions?.circle?.[key] ||
    (alternativeSpelling && configOptions?.circle?.[alternativeSpelling]) ||
    configOptions?.[key] ||
    (alternativeSpelling && configOptions?.[alternativeSpelling]) ||
    defaultConfig[key]
  );
}

function _deepMerge(target, source) {
  const output = { ...target };

  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      output[key] = _deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }

  return output;
}

/**
 *
 * https://terradraw.io/#/api
 */
class ToroDrawControl {
  _isDeleting = false;
  _selectedFeatureId = null;
  _hiddenLayersSnapshot = null;

  constructor(el, options = {}) {
    this._el = el;
    this._widgetInstance = el.widgetInstance;

    this._options = options;
    this._id = options.id || 'draw-control';

    let modes = options?.modes || ['polygon'];
    modes = modes.flat ? modes.flat() : [].concat(...modes);
    this._modes = modes.filter((mode) => validDrawModes.includes(mode));

    if (!this._options.config) {
      this._options.config = {};
    }

    // This is currently not supported. There are some bugs with circles not being able to be
    // selected after being edited.
    this._options.config.editable = false;
    const isEditable = this._options.config?.editable;

    /**
     * https://github.com/JamesLMilner/terra-draw/blob/main/guides/4.MODES.md
     *
     * Selector mode is included to stop a draw mode after a shape has been created.
     */
    const selectConfig = isEditable ? _getSelectConfig(true) : _getSelectConfig();
    this._drawModes = [
      new terraDraw.TerraDrawSelectMode({
        ..._deepMerge(selectConfig, this._options.selectConfig || {}),
        styles: this.getStyling('select'),
      }),
    ];
    this._modes.forEach((mode) => {
      switch (mode) {
        case 'polygon':
          this._drawModes.push(
            new terraDraw.TerraDrawPolygonMode({
              styles: this.getStyling('polygon'),
              editable: isEditable,
            }),
          );
          break;
        case 'line':
          this._drawModes.push(
            new terraDraw.TerraDrawLineStringMode({
              styles: this.getStyling('linestring'),
              editable: isEditable,
            }),
          );
          break;
        case 'point':
          this._drawModes.push(
            new terraDraw.TerraDrawPointMode({
              styles: this.getStyling('point'),
              editable: isEditable,
            }),
          );
          break;
        case 'circle':
          this._drawModes.push(
            new terraDraw.TerraDrawCircleMode({
              styles: this.getStyling('circle'),
              editable: isEditable,
            }),
          );
          break;
        case 'freehand':
          this._drawModes.push(
            new terraDraw.TerraDrawFreehandMode({
              styles: this.getStyling('freehand'),
              editable: isEditable,
            }),
          );
          break;
        case 'delete':
          break;
        default:
          throw new Error(`Unknown draw mode: ${mode}`);
      }
    });
  }

  updateStyle(drawMode, newStyle) {
    if (this._draw) this._draw.updateModeOptions(drawMode, { styles: newStyle });
  }

  getDrawnShape(id) {
    return this._draw.getSnapshot()?.find((shape) => shape.id == id);
  }

  updateShinyAllDrawnShapes() {
    const snapshot = this._draw.getSnapshot();
    const geojson = JSON.stringify(snapshot);
    updateShiny(this._el.id + '_all_drawn_shapes', geojson);
  }

  addListeners() {
    if (!this._draw) return;

    this._draw.on('change', (ids, type, context) => {
      /**
       * Available types:
       * - 'create':
       * - 'update':
       * - 'delete': Shape has finished being created
       * - 'styling': Changes to a modes style
       *
       * To see what part of the target was changed (context?.target):
       * - "properties"
       * - "geometry"
       */
    });
    this._draw.on('finish', (id, context) => {
      if (context.action === 'draw') {
        const geojson = JSON.stringify(this.getDrawnShape(id));
        updateShiny(this._el.id + '_shape_created', geojson);
        this.updateShinyAllDrawnShapes();
        this.updateMode('select');
      } else if (context.action === 'dragFeature') {
        // Do something for a drag finish event
      } else if (context.action === 'dragCoordinate') {
        //
      } else if (context.action === 'dragCoordinateResize') {
        //
      }
    });
    // "deselect" is also an event
    this._draw.on('select', (id) => {
      this._selectedFeatureId = id;

      if (this._isDeleting) {
        // Want to remove this drawn shape.
        //
        // NOTE: terra-draw's own SelectMode.onClick -> select(id) handler is still executing
        // further down the call stack when this 'select' event fires (it emits 'select' partway
        // through its own processing, then continues on afterwards to fetch the feature's
        // geometry again for its own selection/midpoint bookkeeping). If we remove the feature
        // synchronously here, that later internal lookup fails with
        // "No feature with this id, can not get geometry copy" because the feature is already
        // gone. Deferring to the next tick lets terra-draw finish its own click handling first.
        setTimeout(() => {
          if (!this._draw.hasFeature(id)) return;
          this.updateMode('select');
          this._draw.deselectFeature(id);
          this._draw.removeFeatures([id]);
          this.updateShinyAllDrawnShapes();
          updateShiny(
            this._el.id + '_shape_deleted',
            JSON.stringify({
              deleted_id: id,
              time_clicked: Date.now(), // To allow for multiple clicks of the same feature
            }),
          );
        }, 0);
      } else {
        const shape = this.getDrawnShape(id);
        updateShiny(
          this._el.id + '_feature_click',
          JSON.stringify({
            ...shape,
            time_clicked: Date.now(), // To allow for multiple clicks of the same feature
          }),
        );
        if (this._options.config?.editable) {
          this._draw.deselectFeature(id);
        }
      }
    });
  }

  updateMode(mode, onlyUpdateClass = false) {
    const modeButtons = this._container.querySelectorAll('.toro-draw-ctrl-mode');

    modeButtons?.forEach((btn) => {
      if (btn.className.includes('selected-mode')) {
        btn.classList.remove('selected-mode');
      }

      if (btn.className.includes(`toro-draw-ctrl-${mode}`)) {
        btn.classList.add('selected-mode');
      }
    });

    if (!onlyUpdateClass && mode !== 'delete') {
      if (mode === 'select') {
        this._selectedFeatureId = null;
      }
      this._draw.setMode(mode);

      // Change of mode (that is not 'delete') means not longer deleting
      if (this._isDeleting) {
        this._isDeleting = false;
      }
    } else if (!onlyUpdateClass) {
      this._isDeleting = !this._isDeleting;
      this._draw.setMode('select');
      if (this._selectedFeatureId) {
        this._draw.deselectFeature(this._selectedFeatureId);
        this._selectedFeatureId = null;
      }
    }
  }

  createUI() {
    this._container = document.createElement('div');
    this._container.id = this._id;
    this._container.className = 'toro-ctrl draw-control';

    if (this._options.config?.direction == 'h') {
      this._container.className += ' control-direction-h';
    } else {
      this._container.className += ' control-direction-v';
    }

    this._modes.forEach((mode) => {
      const btn = document.createElement('button');
      btn.className = `toro-draw-ctrl-mode toro-draw-ctrl-${mode}`;
      let buttonText = mode;
      if (this._options.modeLabels?.[mode]) {
        buttonText = this._options.modeLabels[mode];
        btn.insertAdjacentHTML('beforeend', buttonText);
      }

      if (mode === 'line') {
        mode = 'linestring';
      }
      btn.addEventListener('click', () => this.updateMode(mode));
      this._container.appendChild(btn);
    });

    return this._container;
  }

  onAdd(map) {
    this._map = map;
    this._draw = new terraDraw.TerraDraw({
      adapter: new terraDrawMaplibreGlAdapter.TerraDrawMapLibreGLAdapter({ map }),
      modes: this._drawModes,
    });
    this.addListeners();
    this._draw.start();

    this._container = this.createUI();
    if (this._options.features) {
      // Add any initial features to the draw
      this.addDrawnShape(this._options.features);
    }
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._draw.stop();
    this._map = undefined;
  }

  setVisible(show) {
    if (this._container) {
      this._container.style.display = show ? 'flex' : 'none';
      this._container.style.pointerEvents = show ? 'auto' : 'none';
    }
    // Also toggle the visibility of the drawn layers
    // TODO: Bug here where features crossing the antimeridian line do not get added again correctly
    if (show && this._hiddenLayersSnapshot) {
      this._draw.addFeatures(structuredClone(this._hiddenLayersSnapshot));
      this._hiddenLayersSnapshot = null;
    } else if (!show) {
      this._hiddenLayersSnapshot = this._draw.getSnapshot();
      this._draw.clear();
    }
  }

  deleteDrawnShape(shapeId) {
    this._draw.removeFeatures([shapeId]);
    this.updateShinyAllDrawnShapes();
  }

  addDrawnShape(geojson) {
    geojson = _cleanModifiedFeature(geojson);

    const [result] = this._draw.addFeatures(geojson);

    if (!result.valid) {
      /**
       * The feature was not added, send a message back to Shiny on why it was not added.
       * A warning will also print in the browser console with the same message in case the Shiny
       * input for `<map-id>_added_shape` is not observed.
       */
      updateShiny(this._el.id + '_added_shape', result);
    } else {
      this.updateMode('select');
      this.updateShinyAllDrawnShapes();
    }
  }

  updateDrawnShape(shapeId, geojson) {
    geojson = _cleanModifiedFeature(geojson);

    // Need to update the geometry and properties separately
    this._draw.updateFeatureGeometry(shapeId, geojson[0].geometry);
    const properties = geojson[0].properties;
    delete properties.mode;
    this._draw.updateFeatureProperties(shapeId, properties);

    this.updateMode('select');
    this.updateShinyAllDrawnShapes();
  }

  /**
   *
   * https://github.com/JamesLMilner/terra-draw/blob/main/guides/5.STYLING.md
   *
   * @param {string} drawMode The draw mode to fetch styling for.
   * @returns
   */
  getStyling(drawMode) {
    let itemKeys = [];
    if (['point', 'select'].includes(drawMode)) {
      itemKeys = [
        ...itemKeys,
        ...[
          'pointColor',
          'pointOpacity',
          'pointWidth',
          'pointOutlineColor',
          'pointOutlineOpacity',
          'pointOutlineWidth',
          // Selected specific styling
          'selectedPointColor',
          'selectedPointOpacity',
          'selectedPointWidth',
          'selectedPointOutlineColor',
          'selectedPointOutlineOpacity',
          'selectedPointOutlineWidth',
        ],
      ];
    }
    if (['linestring', 'freehand_linestring', 'polyline', 'select'].includes(drawMode)) {
      itemKeys = [
        ...itemKeys,
        ...[
          'lineStringColor',
          'lineStringOpacity',
          'lineStringWidth',
          'lineStringDash',
          // Selected specific styling
          'selectedLineStringColor',
          'selectedLineStringOpacity',
          'selectedLineStringWidth',
        ],
      ];
    }
    if (
      ['linestring', 'freehand_linestring', 'polygon', 'freehand', 'polyline', 'select'].includes(
        drawMode,
      )
    ) {
      itemKeys = [
        ...itemKeys,
        ...[
          'closingPointColor',
          'closingPointOpacity',
          'closingPointWidth',
          'closingPointOutlineColor',
          'closingPointOutlineOpacity',
          'closingPointOutlineWidth',
          // Selected specific styling
          'selectionPointColor',
          'selectionPointOpacity',
          'selectionPointOutlineColor',
          'selectionPointOutlineOpacity',
          'selectionPointWidth',
          'selectionPointOutlineWidth',
          // Mid points
          'midPointColor',
          'midPointOpacity',
          'midPointOutlineColor',
          'midPointOutlineOpacity',
          'midPointWidth',
          'midPointOutlineWidth',
        ],
      ];
    }
    if (
      [
        'circle',
        'rectangle',
        'angled_rectangle',
        'sector',
        'sensor',
        'polygon',
        'freehand',
        'select',
      ].includes(drawMode)
    ) {
      itemKeys = [
        ...itemKeys,
        ...['fillColor', 'fillOpacity', 'outlineColor', 'outlineOpacity', 'outlineWidth'],
      ];
    }
    if (['sensor', 'select'.includes(drawMode)]) {
      itemKeys = [
        ...itemKeys,
        ...[
          'centerPointColor',
          'centerPointOpacity',
          'centerPointWidth',
          'centerPointOutlineColor',
          'centerPointOutlineOpacity',
          'centerPointOutlineWidth',
        ],
      ];
    }
    if (['polyline', 'select'].includes(drawMode)) {
      itemKeys = [
        ...itemKeys,
        ...[
          'polygonFillColor',
          'polygonFillOpacity',
          'polygonOutlineColor',
          'polygonOutlineOpacity',
          'polygonOutlineWidth',
          'snappingPointColor',
          'snappingPointOpacity',
          'snappingPointWidth',
          'snappingPointOutlineColor',
          'snappingPointOutlineOpacity',
          'snappingPointOutlineWidth',
          // Selected specific styling
          'selectedPolygonColor',
          'selectedPolygonFillOpacity',
          'selectedPolygonOutlineColor',
          'selectedPolygonOutlineOpacity',
          'selectedPolygonOutlineWidth',
        ],
      ];
    }

    let style = {};
    const defaultStyling = _getDefaultStyling(
      this._options.config?.editable || false,
      this._options.activeColour,
      this._options.inactiveColour,
    );
    for (const itemKey of itemKeys) {
      let value;
      if (itemKey.includes('Color')) {
        value = _getConfigValue(
          itemKey,
          this._options.style,
          defaultStyling,
          itemKey.replaceAll('Color', 'Colour'),
        );
      } else {
        value = _getConfigValue(itemKey, this._options.style, defaultStyling);
      }
      style = {
        ...style,
        [itemKey]: value,
      };
    }

    return style;
  }
}

function _cleanModifiedFeature(geojson, type = 'add') {
  if (geojson.type == 'FeatureCollection') {
    geojson = geojson.features;
  }
  if (!Array.isArray(geojson)) {
    geojson = [geojson];
  }

  for (let i in [...Array(geojson.length).keys()]) {
    const geomType = geojson[i].geometry.type;

    if (type == 'add') {
      // Terra draw requires UUID4 IDs
      // Update will already be using a UUID4 ID to identify the shape to update
      geojson[i].properties.toro_id = geojson[i].id;
      geojson[i].id = crypto.randomUUID();
    }

    if (geomType === 'Polygon') {
      geojson[i].properties.mode = 'polygon';
    } else if (geomType === 'Circle') {
      geojson[i].properties.mode = 'circle';
    } else if (geomType === 'LineString') {
      geojson[i].properties.mode = 'linestring';
    } else if (geomType === 'Point') {
      geojson[i].properties.mode = 'point';
    }
  }
  return geojson;
}

/**
 * Add a draw control to a map.
 *
 * Will delete any draw control with the same ID before adding a new one.
 *
 * @param {object} el Widget element containing the map instance.
 * @param {object} options Draw control options.
 * @returns {void}
 */
function addDrawControl(el, options = {}) {
  const controlId = options.id || 'draw_control';

  const map = removeDrawControl(el, controlId);

  const control = new ToroDrawControl(el, options);
  map.addControl(control, options.position || 'bottom-left');
  map._toroControls[controlId] = control;
}

/**
 * Remove a draw control from a map.
 *
 * @param {object} el Widget element containing the map instance.
 * @param {string} controlId ID of the draw control to remove.
 * @returns {object} The map object.
 */
function removeDrawControl(el, controlId) {
  const map = el.mapInstance;

  if (!map._toroControls) map._toroControls = {};

  if (map._toroControls?.[controlId]) {
    map.removeControl(map._toroControls[controlId]);
    delete map._toroControls[controlId];
  }
  return map;
}

/**
 * Toggle the visibility of a draw control.
 *
 * @param {object} el Widget element containing the map instance.
 * @param {string} controlId ID of the draw control to toggle.
 * @param {boolean} show Whether to show the control. Default is `true`.
 * @returns {void}
 */
function toggleDrawControl(el, controlId, show = true) {
  const map = el.mapInstance;

  if (map._toroControls?.[controlId]) {
    const control = map._toroControls[controlId];
    if (control) {
      control.setVisible(show);
    }
  }
}

/**
 * Remove a draw control from the map.
 *
 * @param {object} el Widget element containing the map instance.
 * @param {string} shapeId The ID of the shape to delete. Must match the ID of the shape the draw
 *   control uses.
 * @param {string} controlId ID of the draw control to remove.
 * @returns {void}
 */
function deleteDrawnShape(el, shapeId, controlId) {
  const map = el.mapInstance;
  const control = map._toroControls && map._toroControls[controlId];

  if (!control) return;

  control.deleteDrawnShape(shapeId);
}

/**
 * Modify a draw controls shapes.
 *
 * Used for both add and update changes to shapes.
 *
 * @param {object} el Widget element containing the map instance.
 * @param {string} type One of ['add', 'update'] to indicate the type of modification.
 * @param {object} geojson The geojson of the shape to add. This should include an ID value. If not,
 *   one will be randomly generated.
 * @param {string} controlId ID of the draw control to make changes to.
 * @param {sting|null} shapeId Optional ID of the shape to modify. Only needed for type = "update".
 * @returns {void}
 */
function modifyDrawnShapes(el, type, geojson, controlId, shapeId) {
  const map = el.mapInstance;
  const control = map._toroControls && map._toroControls[controlId];

  if (!control) return;
  if (type == 'add') control.addDrawnShape(geojson);
  if (type == 'update') control.updateDrawnShape(shapeId, geojson);
}

if (HTMLWidgets.shinyMode) {
  Shiny.addCustomMessageHandler('hideDrawControl', function (message) {
    withMapInstance(message.id, function (el) {
      toggleDrawControl(el, message.controlId, false);
    });
  });

  Shiny.addCustomMessageHandler('showDrawControl', function (message) {
    withMapInstance(message.id, function (el) {
      toggleDrawControl(el, message.controlId, true);
    });
  });

  Shiny.addCustomMessageHandler('addDraw', function (message) {
    withMapInstance(message.id, function (el) {
      const options = message.options;
      addDrawControl(el, options);
    });
  });
  Shiny.addCustomMessageHandler('removeDraw', function (message) {
    withMapInstance(message.id, function (el) {
      const options = message.options;
      removeDrawControl(el, message.controlId);
    });
  });

  Shiny.addCustomMessageHandler('addDrawnShape', function (message) {
    withMapInstance(message.id, function (el) {
      modifyDrawnShapes(el, 'add', message.geometry, message.controlId);
    });
  });

  Shiny.addCustomMessageHandler('updateDrawnShape', function (message) {
    withMapInstance(message.id, function (el) {
      modifyDrawnShapes(el, 'update', message.geometry, message.controlId, message.shapeId);
    });
  });

  Shiny.addCustomMessageHandler('deleteDrawnShape', function (message) {
    withMapInstance(message.id, function (el) {
      deleteDrawnShape(el, message.shapeId, message.controlId);
    });
  });
}
