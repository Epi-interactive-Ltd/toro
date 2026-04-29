/**
 * @file map.js
 * @summary The toro map widget definition using MapLibre GL JS.
 *
 * @description
 * The toro map widget provides an interface for creating and managing
 * interactive maps using MapLibre GL JS.
 */

HTMLWidgets.widget({
  name: 'map',
  type: 'output',

  factory: function (el, width, height) {
    let mapInstance = null;

    return {
      renderValue: function (x) {
        if (typeof maplibregl === 'undefined') {
          console.error('MapLibre GL JS not loaded.');
          return;
        }
        if (mapInstance) {
          mapInstance.remove();
        }
        // Clear the container
        el.innerHTML = '';

        // Create the map
        mapInstance = new maplibregl.Map({
          container: el.id,
          style: {
            version: 8,
            glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
            sources: {},
            layers: [],
          },
          center: x.center,
          zoom: x.zoom,
          attributionControl: false,
          fadeDuration: 0, // this is in order for the text and circles to move "as-one"
          ...x.options,
        });

        el.mapInstance = mapInstance; // Attach to the element for later access
        window[el.id] = this; // Store the instance globally for debugging
        el.widgetInstance = this;
        this.id = el.id; // Make ID available directly on widget instance

        el.ourLayers = []; // Layers added by us
        el.tileLayers = [];
        el.imageTileLayers = [];

        el.maxZoom = x.options.maxZoom; // Set the max zoom level
        el.minZoom = x.options.minZoom; // Set the min zoom level
        el.draw = null;
        el.animations = {}; // Store any ongoing animations

        el.openClusterId = null; // ID of the currently open cluster

        // Global cluster options to apply to all clusters unless overridden at the layer level
        el.clusterOptions = {
          circleOptions: getClusterCircleOptions(x.options.clusterColour, x.options.clusterOptions),
          textOptions: getClusterTextOptions(x.options.clusterOptions),
          spiderfyOptions: {
            maxSpiderfyPins: x.options?.clusterOptions?.spiderfyOptions?.maxSpiderfyPins || 100,
            ...getSpiderfyOptions(x.options.clusterOptions?.spiderfyOptions),
          },
        };
        el.clusterColour = x.options.clusterColour;

        // Add any images that need to be added to the map for pins/icons
        addImagesToMap(mapInstance, x.options.imageSources);

        if (HTMLWidgets.shinyMode) {
          /**
           * If the map is being used in Shiny, do a few things on load:
           * - Update Shiny inputs for the map's view properties
           */
          mapInstance.on(['load', 'moveend'], function () {
            updateShinyView(el, mapInstance);
          });
        }
        /**
         * Load only triggers once the map has fully loaded (one time).
         * Add any layers/sources needed after the map is fully loaded.
         * Also, update the Shiny input for the map's loaded state.
         */
        mapInstance.on('load', function () {
          mapInstance.resize();

          if (x.sources) {
            x.sources.forEach((source) =>
              addDataSourceToMap(mapInstance, source.sourceId, source.sourceOptions)
            );
          }

          if (x.featureSources) {
            x.featureSources.forEach((featureSource) => {
              addFeatureServerSource(el, featureSource.sourceUrl, featureSource.sourceId);
            });
          }

          // Add the default pin image source
          _addImageToMapSource(
            mapInstance,
            'toro-pin',
            'https://raw.githubusercontent.com/Epi-interactive-Ltd/toro/refs/heads/dev/inst/assets/toro-pin.png'
          );

          if (x.imageSources) {
            x.imageSources.forEach((imageSource) =>
              _addImageToMapSource(mapInstance, imageSource.imageId, imageSource.imageUrl)
            );
          }

          initiateTiles(el, x);
          if (x.mapServerTiles) {
            x.mapServerTiles.forEach((layer) =>
              addTilesFromMapServer(el.widgetInstance, layer.tileId, layer.mapServiceUrl)
            );
          }

          if (x.imageLayerTiles) {
            x.imageLayerTiles.forEach((layer) =>
              addTilesFromMapServer(el.widgetInstance, layer.tileId, layer.mapServiceUrl, true)
            );
          }

          addSpiderfyingLayers(el);

          if (x.layers) {
            x.layers.forEach((layer) => addLayerToMap(el, layer));
          }
          if (x.routes) {
            x.routes.forEach((layer) => addRoute(el, layer));
          }

          if (!x.options.enable3D) {
            disable3DView(el.mapInstance);
          }

          if (x.setBounds) {
            setMapBounds(mapInstance, x.setBounds.bounds, x.setBounds.maxZoom, x.setBounds.padding);
          }

          if (x.setZoom) {
            mapInstance.setZoom(x.setZoom);
          }

          if (x.latLngGrid) {
            addLatLngGrid(el, x.latLngGrid.gridColour);
          }

          // Ensures that the controls are added in the desired order
          if (x.controls) {
            x.controls.forEach((control) => {
              if (control.type === 'cursor') {
                if (control.panelId) {
                  // Will be added to panel later during panel processing
                  return;
                }
                addCursorCoordinateControl(
                  mapInstance,
                  control.position,
                  control.longLabel,
                  control.latLabel,
                  el.widgetInstance
                );
              } else if (control.type === 'zoom') {
                if (control.panelId) {
                  // Will be added to panel later during panel processing
                  return;
                }
                addZoomControl(
                  mapInstance,
                  control.position,
                  control.controlOptions,
                  el.widgetInstance
                );
              } else if (control.type === 'custom') {
                if (control.panelId) {
                  // Will be added to panel later during panel processing
                  return;
                }
                addCustomControl(mapInstance, control.controlId, control.html, control.position);
              } else if (control.type === 'draw') {
                if (control.panelId) {
                  // Will be added to panel later during panel processing
                  return;
                }
                addDrawControl(
                  el,
                  control.position,
                  control.modes,
                  control.activeColour,
                  control.inactiveColour,
                  control.modeLabels,
                  control.controlId
                );
              } else if (control.type === 'animation') {
                addAnimationControlButton(el.widgetInstance, control);
              }
            });
          }

          // Process control panels
          if (x.controlPanels && Object.keys(x.controlPanels).length > 0) {
            Object.keys(x.controlPanels).forEach(function (panelId) {
              const panel = x.controlPanels[panelId];
              const options = panel.options || {};

              addControlPanel(el, panelId, options);

              // Add any custom controls specified for this panel
              if (options.customControls && options.customControls.length > 0) {
                options.customControls.forEach(function (control) {
                  addHtmlToPanel(el.widgetInstance, panelId, control);
                });
              }

              // Add any panel controls added via add_control_to_panel
              if (options.panelControls && options.panelControls.length > 0) {
                options.panelControls.forEach(function (control) {
                  if (control.type === 'timeline') {
                    // Create dummy callback functions for initial rendering
                    const dummyPlayPause = function (playing) {};
                    const dummySliderChange = function (progress) {};

                    const timelineElement = addTimelineControl(
                      el.widgetInstance,
                      control.options.startDate,
                      control.options.endDate,
                      dummyPlayPause,
                      dummySliderChange,
                      control.options
                    );
                    addHtmlToPanel(el.widgetInstance, panelId, timelineElement, control.title);
                  } else if (control.type === 'speed') {
                    // Create dummy callback function for initial rendering
                    const dummySpeedChange = function (speed) {
                      // console.log("Speed changed to:", speed);
                    };

                    const speedElement = addSpeedControl(
                      el.widgetInstance,
                      dummySpeedChange,
                      control.options
                    );
                    addHtmlToPanel(el.widgetInstance, panelId, speedElement, control.title);
                  } else if (control.type === 'custom') {
                    addHtmlToPanel(el.widgetInstance, panelId, control.options.html, control.title);
                  } else if (control.type === 'group') {
                    // Add control group to the panel
                    addControlGroup(el, panelId, control);
                  }
                });
              }

              // Add controls from x.controls that were designated for this panel
              if (x.controls) {
                x.controls.forEach(function (control) {
                  if (control.panelId === panelId) {
                    addControlToPanel(el, panelId, {
                      type: control.type,
                      options: control,
                      title: control.panelTitle,
                    });
                  }
                });
              }
            });
          }

          // Process timeline controls (both standalone and panel-based)
          if (x.timelineControls && Object.keys(x.timelineControls).length > 0) {
            Object.keys(x.timelineControls).forEach(function (controlId) {
              const timelineOptions = x.timelineControls[controlId];

              // Pass null callbacks for initial timeline control so it starts disabled
              // It will be enabled automatically when connected to an animation
              addTimelineControl(
                el.widgetInstance,
                timelineOptions.startDate,
                timelineOptions.endDate,
                null, // No play/pause callback - will be disabled
                null, // No slider callback - will be disabled
                timelineOptions
              );
            });
          }

          // Process speed controls (both standalone and panel-based)
          if (x.speedControls && Object.keys(x.speedControls).length > 0) {
            Object.keys(x.speedControls).forEach(function (controlId) {
              const speedOptions = x.speedControls[controlId];

              // Pass null callback for initial speed control so it starts disabled
              // It will be enabled automatically when connected to an animation
              addSpeedControl(
                el.widgetInstance,
                null, // No speed change callback - will be disabled
                speedOptions
              );
            });
          }

          // Process tile selector controls (both standalone and panel-based)
          if (x.tileSelectorControls && Object.keys(x.tileSelectorControls).length > 0) {
            Object.keys(x.tileSelectorControls).forEach(function (controlId) {
              const tileSelectorOptions = x.tileSelectorControls[controlId];

              // Create tile change callback that uses the existing setTileLayer function
              const tileChangeCallback = function (selectedTile) {
                setTileLayer(el, selectedTile);
              };

              // Set available tiles from the map's loaded tiles if not specified
              if (!tileSelectorOptions.availableTiles) {
                tileSelectorOptions.availableTiles = el.tileLayers ||
                  x.loadedTiles || ['lightgrey'];
              }

              addTileSelectorControl(el.widgetInstance, tileChangeCallback, tileSelectorOptions);
            });
          }

          // Process layer selector controls (both standalone and panel-based)
          if (x.layerSelectorControls && Object.keys(x.layerSelectorControls).length > 0) {
            Object.keys(x.layerSelectorControls).forEach(function (controlId) {
              const layerSelectorOptions = x.layerSelectorControls[controlId];

              // Create layer change callback that manages layer visibility
              const layerChangeCallback = function (selectedLayer, previousLayer) {
                // Layer visibility is already managed by the control itself
                // console.log(
                //   `Layer changed from "${previousLayer || "none"}" to "${
                //     selectedLayer || "none"
                //   }"`
                // );
              };

              addLayerSelectorControl(el.widgetInstance, layerChangeCallback, layerSelectorOptions);
            });
          }

          // Process cluster toggle controls (both standalone and panel-based)
          if (x.clusterToggleControls && Object.keys(x.clusterToggleControls).length > 0) {
            Object.keys(x.clusterToggleControls).forEach(function (controlId) {
              const toggleOptions = x.clusterToggleControls[controlId];

              if (toggleOptions.panelId) {
                // Add to control panel
                addClusterToggleControlToPanel(
                  el.widgetInstance,
                  toggleOptions.panelId,
                  toggleOptions,
                  toggleOptions.panelTitle
                );
              } else {
                // Add as standalone control
                addClusterToggleControl(
                  el.mapInstance,
                  toggleOptions.controlId,
                  toggleOptions.layerId,
                  toggleOptions.leftLabel,
                  toggleOptions.rightLabel,
                  toggleOptions.initialState,
                  toggleOptions.position,
                  el.widgetInstance
                );
              }
            });
          }

          // Process visibility toggle controls (both standalone and panel-based)
          if (x.visibilityToggleControls && Object.keys(x.visibilityToggleControls).length > 0) {
            Object.keys(x.visibilityToggleControls).forEach(function (controlId) {
              const toggleOptions = x.visibilityToggleControls[controlId];

              if (toggleOptions.panelId) {
                // Add to control panel
                addVisibilityToggleControlToPanel(
                  el.widgetInstance,
                  toggleOptions.panelId,
                  toggleOptions,
                  toggleOptions.panelTitle
                );
              } else {
                // Add as standalone control
                addVisibilityToggleControl(
                  el.mapInstance,
                  toggleOptions.controlId,
                  toggleOptions.layerId,
                  toggleOptions.leftLabel,
                  toggleOptions.rightLabel,
                  toggleOptions.initialState,
                  toggleOptions.position,
                  el.widgetInstance
                );
              }
            });
          }

          if (HTMLWidgets.shinyMode) {
            // Trigger a input event to notify Shiny that the map is loaded
            Shiny.setInputValue(el.id + '_loaded', Math.random(), {
              priority: 'event',
            });
          }

          // Add event handlers to close popups on various map interactions
          setupPopupCloseHandlers(mapInstance);

          mapInstance.addControl(
            new maplibregl.AttributionControl({
              compact: true,
              collapsible: true,
            }),
            x.options.attributionPosition || 'bottom-right'
          );

          closeAttribution(el.id, el.widgetInstance); // By default, close the attribution panel
        });

        // ------------------------------------------------------------

        el.initiallyLoaded = x.options.initialLoadedLayers == null ? true : false; // Track if the map was initially loaded without a loader

        if (HTMLWidgets.shinyMode && !el.initiallyLoaded && x.options.initialLoadedLayers) {
          addMapLoader(
            el,
            false,
            x.options.initialLoaderBgColour,
            toRgbValues(x.options.initialLoaderColour)
          );
        }

        // Idle event when sources and layers are loaded
        if (HTMLWidgets.shinyMode && !el.initiallyLoaded && x.options.initialLoadedLayers) {
          /**
           * Check if all the initial layers are loaded by comparing the current layers on the map with the list of initial loaded layers.
           * Once all initial layers are loaded, remove the loading overlay and set initiallyLoaded to true to prevent this check from running again.
           *
           * @param {object} e The event object from the 'idle' event.
           * @return {void}
           */
          function initialMapLoaderHandler(e) {
            var currentLayers = el.mapInstance
              .getStyle()
              .layers.map((layer) => layer.id)
              .filter((layerId) => {
                // Filter out layers that are not in the initial loaded layers
                return x.options.initialLoadedLayers.includes(layerId);
              });

            if (currentLayers.length === x.options.initialLoadedLayers.length) {
              // Remove the loading overlay if all initial layers are loaded
              removeMapLoader(el);
              el.initiallyLoaded = true;
            }
          }
          el.mapInstance.on('idle', initialMapLoaderHandler);
        } else if (HTMLWidgets.shinyMode && el.initiallyLoaded) {
          el.mapInstance.off('idle', initialMapLoaderHandler);
        }
        if (HTMLWidgets.shinyMode && x.options.spinnerWhileBusy) {
          /**
           * Show a loading spinner overlay when Shiny is busy, and hide it when Shiny is idle. The spinner will only show if Shiny has been busy for more than 1 second to avoid flashing for quick operations.
           *
           * @note This implementation uses a timer to delay showing the spinner until Shiny has been busy for more than 1 second.
           * If Shiny becomes idle before the timer completes, the spinner will not be shown.
           *
           * @param {object} e The event object from the 'shiny:busy' or 'shiny:idle' event.
           * @return {void}
           */
          function showSpinner() {
            addMapLoader(
              el,
              (changeLoader = true),
              x.options.busyLoaderBgColour,
              x.options.busyLoaderColour
            );
          }
          /**
           * Hide the loading spinner overlay.
           *
           * @param {object} e The event object from the 'shiny:idle' event.
           * @return {void}
           */
          function hideSpinner() {
            removeMapLoader(el);
          }
          el.busyTimer = null;
          el.spinnerShown = false;

          $(document).on('shiny:busy', function () {
            // Start timer only if not already started
            if (!el.busyTimer && el.initiallyLoaded) {
              el.busyTimer = setTimeout(function () {
                // Shiny has been busy for more than 1 second
                el.spinnerShown = true;
                showSpinner(); // <-- your function to show spinner
              }, 10);
            }
          });

          $(document).on('shiny:idle', function () {
            if (!el.initiallyLoaded) {
              return; // Don't hide spinner if map is not initially loaded
            }
            if (el.busyTimer) {
              // Cancel timer if busy < 1s
              clearTimeout(el.busyTimer);
              el.busyTimer = null;
            }
            if (el.spinnerShown) {
              // If spinner was shown, hide it
              hideSpinner(); // <-- your function to hide spinner
              el.spinnerShown = false;
            }
          });
        }
      },

      /**
       * Resize the map when the widget size changes.
       * This should be called whenever the container size changes to ensure the map resizes correctly.
       *
       * @param {number} width The new width of the widget container.
       * @param {number} height The new height of the widget container.
       * @return {void}
       */
      resize: function (width, height) {
        if (mapInstance) {
          mapInstance.resize();
        }
      },

      /**
       * Get the MapLibre map instance associated with this widget.
       * This allows external code to interact directly with the map instance for advanced use cases.
       *
       * @return {object} The MapLibre map instance.
       */
      getMap: function () {
        return mapInstance;
      },

      /**
       * Get the ID of the map element.
       * This can be useful for targeting the map element in custom code or for debugging purposes.
       *
       * @return {string} The ID of the map element.
       */
      getId: function () {
        return el.id;
      },

      /**
       * Get the initial tiles specified for the map.
       * This returns the list of tile layers that were defined as available for the map,
       * which can be used to populate tile selector controls or for other purposes.
       * Note that this is not necessarily the same as the currently active tile layer on the map,
       * which can be obtained using the getCurrentTiles function.
       *
       * @returns {array} The list of initial tile layers specified for the map.
       */
      getInitialTiles: function () {
        return el.initialTiles;
      },

      /**
       * Get the draw control instance for the map, if it has been added.
       * This allows code to interact with the draw control directly, such as changing modes or accessing drawn features.
       *
       * @returns {object|null} The MapLibre Draw control instance, or null if it has not been added to the map.
       */
      getDraw: function () {
        return el.draw;
      },

      /**
       * Get the ongoing animations for the map.
       * This returns an object containing any animations that are currently active on the map, such as flyTo or custom animations.
       * Each animation can be accessed by its unique ID, which can be used to manage the animation (e.g., stop it).
       *
       * @returns {object} An object containing ongoing animations for the map, keyed by their unique IDs.
       */
      getAnimations: function () {
        return el.animations;
      },

      /**
       * Get the available tile layers for the map.
       * This returns the list of tile layers that have been defined as available for the map,
       * which can be used to populate tile selector controls or for other purposes.
       *
       * @returns {array} The list of available tile layers for the map.
       */
      setAvailableTiles: function (tiles) {
        el.tileLayers = tiles;
      },

      /**
       * Get the available image tile layers for the map.
       * This returns the list of image tile layers that have been defined as available for the map,
       * which can be used to populate tile selector controls or for other purposes.
       *
       * @returns {array} The list of available image tile layers for the map.
       */
      getAvailableImageLayerTiles: function () {
        return el.imageTileLayers;
      },

      /**
       * Set the available image tile layers for the map.
       * This allows you to define which image tile layers are available for the map,
       * which can be used to populate tile selector controls or for other purposes.
       * Note that this does not automatically add the image tile layers to the map,
       * they must be added separately using addTilesFromMapServer with the isImageLayer parameter set to true.
       *
       * @param {array} imageTileLayers The list of available image tile layers for the map.
       * @returns {void}
       */
      setAvailableImageLayerTiles: function (imageTileLayers) {
        el.imageTileLayers = imageTileLayers;
      },

      /**
       * Get the available tile layers for the map.
       * This returns the list of tile layers that have been defined as available for the map,
       * which can be used to populate tile selector controls or for other purposes.
       *
       * @returns {array} The list of available tile layers for the map.
       */
      getAvailableTiles: function () {
        return el.tileLayers;
      },

      /**
       * Get the map element associated with this widget.
       * This returns the DOM element that contains the map, which can be useful for direct manipulation or for debugging purposes.
       *
       * @returns {object} The DOM element containing the map.
       */
      getElement: function () {
        return document.querySelector(`#${el.id}.map`);
      },

      /**
       * Get the currently active tile layer on the map.
       * This checks the map's style layers to determine which tile layer is currently visible,
       * excluding the satellite layer which is always visible as a base layer.
       * If no specific tile layer is visible, it checks if the satellite layer is the only one
       * visible and returns that. If no tile layers are visible, it returns null.
       *
       * @returns {string|null} The ID of the currently active tile layer, or null if none are active.
       */
      getCurrentTiles: function () {
        if (!mapInstance || !mapInstance.getStyle) {
          return null;
        }

        try {
          const layers = mapInstance.getStyle().layers;
          if (!layers) return null;

          // Find visible tile layers, excluding satellite which is always visible as base
          for (const layer of layers) {
            if (
              layer.type === 'raster' &&
              layer.id !== 'satellite' &&
              layer.layout &&
              layer.layout.visibility === 'visible'
            ) {
              return layer.id;
            }
          }

          // If no other tile is visible, check if satellite is the only one visible
          const satelliteLayer = layers.find(
            (layer) => layer.id === 'satellite' && layer.type === 'raster'
          );
          if (satelliteLayer) {
            return 'satellite';
          }

          return null;
        } catch (error) {
          console.warn('Error getting current tiles:', error);
          return null;
        }
      },
    };
  },
});

/**
 * Checks if the map instance exists for the given element ID before executing a function.
 *
 * @param {string} id Widget element ID.
 * @param {function} fn Function to execute with the map element.
 * @returns {void}
 */
function withMapInstance(id, fn) {
  var el = document.getElementById(id);
  if (el && el.mapInstance) {
    fn(el);
  } else {
    console.warn('Map element or instance not found for ID:', id);
  }
}

if (HTMLWidgets.shinyMode) {
  Shiny.addCustomMessageHandler('addCursorCoordsControl', function (message) {
    withMapInstance(message.id, function (el) {
      const control = message.control || message;
      if (control.panelId) {
        // Add to control panel
        addControlToPanel(el, control.panelId, {
          type: 'cursor',
          options: control,
          title: control.panelTitle,
        });
      } else {
        // Add as standalone control
        addCursorCoordinateControl(
          el.mapInstance,
          control.position,
          control.longLabel,
          control.latLabel,
          el.widgetInstance
        );
      }
    });
  });

  Shiny.addCustomMessageHandler('setMapZoom', function (message) {
    withMapInstance(message.id, function (el) {
      el.mapInstance.setZoom(message.zoom);
    });
  });

  Shiny.addCustomMessageHandler('addLatLngGrid', function (message) {
    withMapInstance(message.id, function (el) {
      addLatLngGrid(el, message.gridColour);
    });
  });

  Shiny.addCustomMessageHandler('toggleLatLngGrid', function (message) {
    withMapInstance(message.id, function (el) {
      toggleLatLngGrid(el, (show = message.show));
    });
  });

  Shiny.addCustomMessageHandler('hideDrawControls', function (message) {
    withMapInstance(message.id, function (el) {
      hideDrawControls(el);
    });
  });

  Shiny.addCustomMessageHandler('showDrawControls', function (message) {
    withMapInstance(message.id, function (el) {
      showDrawControls(el);
    });
  });

  Shiny.addCustomMessageHandler('addDraw', function (message) {
    withMapInstance(message.id, function (el) {
      const options = message.options;
      if (options.panelId) {
        // Add to control panel
        addControlToPanel(el, options.panelId, {
          type: 'draw',
          options: options,
          title: options.panelTitle,
        });
      } else {
        // Add as standalone control
        addDrawControl(
          el,
          options.position,
          options.modes,
          options.activeColour,
          options.inactiveColour,
          options.modeLabels,
          options.controlId
        );
      }
    });
  });

  Shiny.addCustomMessageHandler('addZoomControl', function (message) {
    withMapInstance(message.id, function (el) {
      if (message.panelId) {
        // Add to control panel
        addControlToPanel(el, message.panelId, {
          type: 'zoom',
          options: message,
          title: message.panelTitle,
        });
      } else {
        // Add as standalone control
        addZoomControl(el.mapInstance, message.position, message.controlOptions, el.widgetInstance);
      }
    });
  });

  Shiny.addCustomMessageHandler('addCustomControl', function (message) {
    withMapInstance(message.id, function (el) {
      const options = message.options || message.control;
      if (options.panelId) {
        // Add to control panel
        addControlToPanel(el, options.panelId, {
          type: 'custom',
          options: options,
          title: options.panelTitle,
        });
      } else {
        // Add as standalone control
        addCustomControl(el.mapInstance, options.controlId, options.html, options.position);
      }
    });
  });

  Shiny.addCustomMessageHandler('toggleControl', function (message) {
    withMapInstance(message.id, function (el) {
      toggleControl(el, message.controlId, message.show);
    });
  });

  Shiny.addCustomMessageHandler('removeControl', function (message) {
    withMapInstance(message.id, function (el) {
      removeControl(el.widgetInstance, message.controlId);
    });
  });

  Shiny.addCustomMessageHandler('removeControlFromPanel', function (message) {
    withMapInstance(message.id, function (el) {
      removeControlFromPanel(el.widgetInstance, message.panelId, message.controlId);
    });
  });

  Shiny.addCustomMessageHandler('addClusterToggleControl', function (message) {
    withMapInstance(message.id, function (el) {
      const options = message.options;
      if (options.panelId) {
        // Add to control panel
        addClusterToggleControlToPanel(
          el.widgetInstance,
          options.panelId,
          options,
          options.panelTitle
        );
      } else {
        // Add as standalone control
        addClusterToggleControl(
          el.mapInstance,
          options.controlId,
          options.layerId,
          options.leftLabel,
          options.rightLabel,
          options.initialState,
          options.position,
          el.widgetInstance
        );
      }
    });
  });

  Shiny.addCustomMessageHandler('addVisibilityToggleControl', function (message) {
    withMapInstance(message.id, function (el) {
      const options = message.options;
      if (options.panelId) {
        // Add to control panel
        addVisibilityToggleControlToPanel(
          el.widgetInstance,
          options.panelId,
          options,
          options.panelTitle
        );
      } else {
        // Add as standalone control
        addVisibilityToggleControl(
          el.mapInstance,
          options.controlId,
          options.layerId,
          options.leftLabel,
          options.rightLabel,
          options.initialState,
          options.position,
          el.widgetInstance
        );
      }
    });
  });

  Shiny.addCustomMessageHandler('deleteDrawnShape', function (message) {
    withMapInstance(message.id, function (el) {
      deleteDrawnShape(el, message.shapeId);
    });
  });

  Shiny.addCustomMessageHandler('setMapBounds', function (message) {
    withMapInstance(message.id, function (el) {
      setMapBounds(
        el.mapInstance,
        message.options.bounds,
        message.options.maxZoom,
        message.options.padding
      );
    });
  });

  Shiny.addCustomMessageHandler('setSelectedTiles', function (message) {
    withMapInstance(message.id, function (el) {
      setTileLayer(el, message.tiles);
    });
  });

  Shiny.addCustomMessageHandler('addFilter', function (message) {
    withMapInstance(message.id, function (el) {
      addFilterToLayer(el.mapInstance, message.layerId, message.filter);
    });
  });

  Shiny.addCustomMessageHandler('toggleClustering', function (message) {
    withMapInstance(message.id, function (el) {
      toggleLayerClustering(el.mapInstance, message.layerId, message.cluster);
    });
  });

  Shiny.addCustomMessageHandler('addLayer', function (message) {
    withMapInstance(message.id, function (el) {
      addLayerToMap(el, message.layer);
    });
  });

  Shiny.addCustomMessageHandler('hideLayer', function (message) {
    withMapInstance(message.id, function (el) {
      if (message.layerId !== 'satellite') {
        /**
         * Satellite layer should always be visible as a backup, and is
         * under other layers if not the selected layer.
         */
        hideLayer(el.mapInstance, message.layerId);
      }
    });
  });

  Shiny.addCustomMessageHandler('showLayer', function (message) {
    withMapInstance(message.id, function (el) {
      showLayer(el.mapInstance, message.layerId);
    });
  });

  Shiny.addCustomMessageHandler('addImageSource', function (message) {
    withMapInstance(message.id, function (el) {
      _addImageToMapSource(el.mapInstance, message.imageId, message.imageUrl);
    });
  });

  Shiny.addCustomMessageHandler('addMapSource', function (message) {
    withMapInstance(message.id, function (el) {
      addDataSourceToMap(el.mapInstance, message.sourceId, message.sourceOptions);
    });
  });

  Shiny.addCustomMessageHandler('addFeatureServerSource', function (message) {
    withMapInstance(message.id, function (el) {
      addFeatureServerSource(el, message.sourceUrl, message.sourceId);
    });
  });

  Shiny.addCustomMessageHandler('updateSourceData', function (message) {
    withMapInstance(message.id, function (el) {
      updateSourceData(el.mapInstance, message.sourceId, message.data);
    });
  });

  Shiny.addCustomMessageHandler('setPaintProp', function (message) {
    withMapInstance(message.id, function (el) {
      el.mapInstance.setPaintProperty(message.layerId, message.property, message.value);
    });
  });

  Shiny.addCustomMessageHandler('setLayoutProp', function (message) {
    withMapInstance(message.id, function (el) {
      el.mapInstance.setLayoutProperty(message.layerId, message.property, message.value);
    });
  });

  Shiny.addCustomMessageHandler('addRoute', function (message) {
    withMapInstance(message.id, function (el) {
      addRoute(el, message.options);
    });
  });

  Shiny.addCustomMessageHandler('animateRoute', function (message) {
    withMapInstance(message.id, function (el) {
      animateRoute(el.widgetInstance, message.options);
    });
  });

  Shiny.addCustomMessageHandler('pauseRoute', function (message) {
    withMapInstance(message.id, function (el) {
      pauseAnimation(el.widgetInstance, message.options);
    });
  });

  Shiny.addCustomMessageHandler('removeRoute', function (message) {
    withMapInstance(message.id, function (el) {
      removeRoute(el.widgetInstance, message.options);
    });
  });

  Shiny.addCustomMessageHandler('addAnimationControls', function (message) {
    withMapInstance(message.id, function (el) {
      addAnimationControlButton(el.widgetInstance, message.options);
    });
  });

  // Control Panel message handlers
  Shiny.addCustomMessageHandler('addControlPanel', function (message) {
    withMapInstance(message.id, function (el) {
      addControlPanel(el, message.panelId, message.options);
    });
  });

  Shiny.addCustomMessageHandler('addControlToPanel', function (message) {
    withMapInstance(message.id, function (el) {
      addControlToPanel(el, message.panelId, message.controlConfig);
    });
  });

  Shiny.addCustomMessageHandler('addControlGroup', function (message) {
    withMapInstance(message.id, function (el) {
      addControlGroup(el, message.panelId, message.groupConfig);
    });
  });

  Shiny.addCustomMessageHandler('removeControlGroup', function (message) {
    withMapInstance(message.id, function (el) {
      removeControlGroup(el, message.panelId, message.groupId);
    });
  });

  Shiny.addCustomMessageHandler('addTimelineControlStandalone', function (message) {
    withMapInstance(message.id, function (el) {
      // Pass null callbacks for standalone timeline control so it starts disabled
      // It will be enabled automatically when connected to an animation
      addTimelineControl(
        el.widgetInstance,
        message.options.startDate,
        message.options.endDate,
        null, // No play/pause callback - will be disabled
        null, // No slider callback - will be disabled
        message.options
      );
    });
  });

  Shiny.addCustomMessageHandler('addSpeedControlStandalone', function (message) {
    withMapInstance(message.id, function (el) {
      // Pass null callback for standalone speed control so it starts disabled
      // It will be enabled automatically when connected to an animation
      addSpeedControl(
        el.widgetInstance,
        null, // No speed change callback - will be disabled
        message.options
      );
    });
  });

  Shiny.addCustomMessageHandler('addTileSelectorControlStandalone', function (message) {
    withMapInstance(message.id, function (el) {
      // Create tile change callback that uses the existing setTileLayer function
      const tileChangeCallback = function (selectedTile) {
        setTileLayer(el, selectedTile);
      };

      // Set available tiles from the map's loaded tiles if not specified
      const tileSelectorOptions = message.options;
      if (!tileSelectorOptions.availableTiles) {
        tileSelectorOptions.availableTiles = el.tileLayers || el.loadedTiles || ['lightgrey'];
      }

      addTileSelectorControl(el.widgetInstance, tileChangeCallback, tileSelectorOptions);
    });
  });

  Shiny.addCustomMessageHandler('addLayerSelectorControlStandalone', function (message) {
    withMapInstance(message.id, function (el) {
      // Create layer change callback that manages layer visibility
      const layerChangeCallback = function (selectedLayer, previousLayer) {
        // Layer visibility is already managed by the control itself
        // console.log(
        //   `Layer changed from "${previousLayer || "none"}" to "${
        //     selectedLayer || "none"
        //   }"`
        // );
      };

      addLayerSelectorControl(el.widgetInstance, layerChangeCallback, message.options);
    });
  });
}
// ============================================================
// Global handler functions for toggle controls in panels
// ============================================================

/**
 * Global handler for cluster toggle controls in panels.
 * This function is called when a cluster toggle control is interacted with,
 * and it manages the clustering state of the specified layer on the map.
 *
 * @param {string} layerId The ID of the layer to toggle clustering for.
 * @param {string} mapId The ID of the map element associated with this control.
 * @param {object} toggleElement The DOM element of the toggle control that was interacted with.
 * @return {void}
 */
window.handleClusterToggle = function (layerId, mapId, toggleElement) {
  const el = document.getElementById(mapId);
  if (el && el.widgetInstance) {
    const map = el.widgetInstance.getMap();

    // Set up enhanced click handling on first call (but don't execute toggle logic)
    if (!toggleElement._enhancedClickSetup) {
      toggleElement._enhancedClickSetup = true;

      // Store the original onclick handler
      const originalOnclick = toggleElement.getAttribute('onclick');

      // Remove the original onclick handler to prevent conflicts
      toggleElement.removeAttribute('onclick');

      // Add enhanced click handling
      const checkbox = toggleElement.querySelector('.toro-toggle-checkbox');

      // Listen for checkbox changes (natural browser behavior)
      if (checkbox) {
        checkbox.addEventListener('change', () => {
          const newState = checkbox.checked;

          // Update map state
          toggleLayerClustering(map, layerId, newState);
          toggleElement.setAttribute('data-clustered', newState.toString());

          // Update visual state
          const switchElement = toggleElement.querySelector('.toro-toggle-switch');
          if (switchElement) {
            if (newState) {
              switchElement.classList.add('checked');
            } else {
              switchElement.classList.remove('checked');
            }
          }

          toggleElement.classList.toggle('active', newState);

          const event = new CustomEvent('cluster-toggle', {
            detail: { layerId: layerId, clustered: newState },
          });
          toggleElement.dispatchEvent(event);
        });
      }

      // Listen for clicks on non-checkbox elements (labels, switch, etc.)
      toggleElement.addEventListener('click', (e) => {
        // Only handle clicks on non-checkbox elements
        if (e.target !== checkbox && !checkbox.contains(e.target)) {
          e.preventDefault();
          e.stopPropagation();

          // Manually toggle the checkbox (this will trigger the change event above)
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
        }
      });

      // Don't execute toggle logic on setup - just return
      return;
    }

    // This is a fallback call (shouldn't normally happen with enhanced handler)
    const currentState = toggleElement.getAttribute('data-clustered') === 'true';
    const newState = !currentState;

    // Toggle clustering
    toggleLayerClustering(map, layerId, newState);

    // Update toggle state
    toggleElement.setAttribute('data-clustered', newState.toString());
    const checkbox = toggleElement.querySelector('.toro-toggle-checkbox');

    if (checkbox) {
      checkbox.checked = newState;
    }
    toggleElement.classList.toggle('active', newState);

    // Emit custom event
    const event = new CustomEvent('cluster-toggle', {
      detail: { layerId: layerId, clustered: newState },
    });
    toggleElement.dispatchEvent(event);
  }
};

/**
 * Global handler for visibility toggle controls in panels.
 * This function is called when a visibility toggle control is interacted with,
 * and it manages the visibility of the specified layer on the map.
 *
 * @param {string} layerId The ID of the layer to toggle visibility for.
 * @param {string} mapId The ID of the map element associated with this control.
 * @param {object} toggleElement The DOM element of the toggle control that was interacted with.
 * @return {void}
 */
window.handleVisibilityToggle = function (layerId, mapId, toggleElement) {
  const el = document.getElementById(mapId);
  if (el && el.widgetInstance) {
    const map = el.widgetInstance.getMap();

    // Set up enhanced click handling on first call (but don't execute toggle logic)
    if (!toggleElement._enhancedClickSetup) {
      toggleElement._enhancedClickSetup = true;

      // Remove the original onclick handler to prevent conflicts
      toggleElement.removeAttribute('onclick');

      // Add enhanced click handling
      const checkbox = toggleElement.querySelector('.toro-toggle-checkbox');

      // Listen for checkbox changes (natural browser behavior)
      if (checkbox) {
        checkbox.addEventListener('change', () => {
          const newState = checkbox.checked;

          // Update map state
          if (newState) {
            showLayer(map, layerId);
          } else {
            hideLayer(map, layerId);
          }

          toggleElement.setAttribute('data-visible', newState.toString());

          // Update visual state
          const switchElement = toggleElement.querySelector('.toro-toggle-switch');
          if (switchElement) {
            if (newState) {
              switchElement.classList.add('checked');
            } else {
              switchElement.classList.remove('checked');
            }
          }

          toggleElement.classList.toggle('active', newState);

          const event = new CustomEvent('visibility-toggle', {
            detail: { layerId: layerId, visible: newState },
          });
          toggleElement.dispatchEvent(event);
        });
      }

      // Listen for clicks on non-checkbox elements (labels, switch, etc.)
      toggleElement.addEventListener('click', (e) => {
        // Only handle clicks on non-checkbox elements
        if (e.target !== checkbox && !checkbox.contains(e.target)) {
          e.preventDefault();
          e.stopPropagation();

          // Manually toggle the checkbox (this will trigger the change event above)
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
        }
      });

      // Don't execute toggle logic on setup - just return
      return;
    }

    // This is a fallback call (shouldn't normally happen with enhanced handler)
    const currentState = toggleElement.getAttribute('data-visible') === 'true';
    const newState = !currentState;

    // Toggle layer visibility
    if (newState) {
      showLayer(map, layerId);
    } else {
      hideLayer(map, layerId);
    }

    // Update toggle state
    toggleElement.setAttribute('data-visible', newState.toString());
    const checkbox = toggleElement.querySelector('.toro-toggle-checkbox');

    if (checkbox) {
      checkbox.checked = newState;
    }
    toggleElement.classList.toggle('active', newState);

    // Emit custom event
    const event = new CustomEvent('visibility-toggle', {
      detail: { layerId: layerId, visible: newState },
    });
    toggleElement.dispatchEvent(event);
  }
};

/**
 * Set up event handlers to close popups on various map interactions.
 * This ensures that popups are closed when the user interacts with the map in other ways.
 *
 * @param {object} map MapLibre map instance
 * @return {void}
 */
function setupPopupCloseHandlers(map) {
  // Close popups when the map is moved (dragged or panned)
  map.on('movestart', function () {
    closeAllPopups(map);
  });

  // Close popups when the map is zoomed
  map.on('zoomstart', function () {
    closeAllPopups(map);
  });

  // Close popups when the map is rotated
  map.on('rotatestart', function () {
    closeAllPopups(map);
  });

  // Close popups when the map is pitched (3D tilt)
  map.on('pitchstart', function () {
    closeAllPopups(map);
  });

  // Close popups when clicking on empty areas of the map (not on features)
  map.on('click', function (e) {
    // Only close if the click wasn't on a feature with a popup
    // We'll let the layer-specific click handlers manage their own popups
    const features = map.queryRenderedFeatures(e.point);

    // Check if any of the clicked features have popup columns
    const hasPopupFeature = features.some((feature) => {
      // This is a simple check - in a more sophisticated setup, you might
      // want to track which layers have popups enabled
      return feature.properties && Object.keys(feature.properties).length > 0;
    });

    // If no features with properties were clicked, close all popups
    if (!hasPopupFeature) {
      closeAllPopups(map);
    }
  });

  // Close popups when any layer is toggled (visibility or clustering)
  map.getContainer().addEventListener('visibility-toggle', function () {
    closeAllPopups(map);
  });

  map.getContainer().addEventListener('cluster-toggle', function () {
    closeAllPopups(map);
  });
}
