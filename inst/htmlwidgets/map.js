HTMLWidgets.widget({
  name: "map",
  type: "output",

  factory: function (el, width, height) {
    let mapInstance = null;

    return {
      renderValue: function (x) {
        if (mapInstance) {
          mapInstance.remove();
        }
        // Clear the container
        el.innerHTML = "";

        // Create the map
        mapInstance = new maplibregl.Map({
          container: el,
          style: {
            version: 8,
            glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
            sources: {},
            layers: [],
          },
          center: x.center,
          zoom: x.zoom,
          minZoom: x.minZoom,
          maxZoom: x.maxZoom,
        });

        el.maxZoom = x.maxZoom; // Set the max zoom level
        el.minZoom = x.minZoom; // Set the min zoom level
        el.draw = null;

        el.openClusterId = null; // ID of the currently open cluster

        el.ourLayers = []; // Layers added by us
        el.tileLayers = [];
        el.clusterColour = x.clusterColour;

        el.mapInstance = mapInstance; // Attach to the element for later access
        window[el.id] = mapInstance; // Store the instance globally for debugging
        el.widgetInstance = this;

        el.initiallyLoaded = x.initialLoadedLayers == null ? true : false; // Track if the map was initially loaded without a loader

        if (!el.initiallyLoaded && x.initialLoadedLayers) {
          addMapLoader(
            el,
            false,
            x.initialLoaderBgColour,
            toRgbValues(x.initialLoaderColour)
          );
        }

        if (x.imageSources) {
          // Add any image sources to the map
          x.imageSources.forEach(function (imageSource) {
            addImageToMapSource(
              el.mapInstance,
              imageSource.id,
              imageSource.url
            );
          });
        }

        el.mapInstance.on("load", function () {
          mapInstance.addLayer({
            id: "background-blue",
            type: "background",
            paint: {
              "background-color": x.backgroundColour,
            },
          });
          initiateTiles(el, x.loadedTiles, x.initialTileLayer);
          addSpiderfyingLayers(el.mapInstance);

          if (!x.enable3D) {
            disable3DView(el.mapInstance);
          }

          // Trigger a input event to notify Shiny that the map is loaded
          Shiny.setInputValue(el.id + "_loaded", Math.random(), {
            priority: "event",
          });

          closeAttribution(el.id);
        });

        // Idle event when sources and layers are loaded
        if (!el.initiallyLoaded && x.initialLoadedLayers) {
          function initialMapLoaderHandler(e) {
            var currentLayers = el.mapInstance
              .getStyle()
              .layers.map((layer) => layer.id)
              .filter((layerId) => {
                // Filter out layers that are not in the initial loaded layers
                return x.initialLoadedLayers.includes(layerId);
              });

            if (currentLayers.length === x.initialLoadedLayers.length) {
              // Remove the loading overlay if all initial layers are loaded
              removeMapLoader(el);
              el.initiallyLoaded = true;
            }
          }
          el.mapInstance.on("idle", initialMapLoaderHandler);
        } else if (el.initiallyLoaded) {
          el.mapInstance.off("idle", initialMapLoaderHandler);
        }
        if (x.spinnerWhileBusy) {

          function showSpinner() {
            addMapLoader(
              el,
              (changeLoader = true),
              x.busyLoaderBgColour,
              x.busyLoaderColour
            );
          }
          function hideSpinner() {
            removeMapLoader(el);
          }
          el.busyTimer = null;
          el.spinnerShown = false;

          $(document).on("shiny:busy", function () {
            // Start timer only if not already started
            if (!el.busyTimer && el.initiallyLoaded) {
              el.busyTimer = setTimeout(function () {
                // Shiny has been busy for more than 1 second
                el.spinnerShown = true;
                showSpinner(); // <-- your function to show spinner
              }, 10);
            }
          });

          $(document).on("shiny:idle", function () {
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

      resize: function (width, height) {
        if (mapInstance) {
          mapInstance.resize();
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
    console.warn("Map element or instance not found for ID:", id);
  }
}

Shiny.addCustomMessageHandler("addCursorCoordsControl", function (message) {
  withMapInstance(message.id, function (el) {
    addCursorCoordinateControl(
      el.mapInstance,
      message.position,
      message.longLabel,
      message.latLabel
    );
  });
});

Shiny.addCustomMessageHandler("setMapZoom", function (message) {
  withMapInstance(message.id, function (el) {
    el.mapInstance.setZoom(message.zoom);
  });
});

Shiny.addCustomMessageHandler("addLatLngGrid", function (message) {
  withMapInstance(message.id, function (el) {
    addLatLngGrid(el, message.gridColour);
  });
});

Shiny.addCustomMessageHandler("hideLatLngGrid", function (message) {
  withMapInstance(message.id, function (el) {
    toggleLatLngGrid(el, (hide = true));
  });
});

Shiny.addCustomMessageHandler("showLatLngGrid", function (message) {
  withMapInstance(message.id, function (el) {
    toggleLatLngGrid(el, (hide = false));
  });
});

Shiny.addCustomMessageHandler("hideDrawControls", function (message) {
  withMapInstance(message.id, function (el) {
    hideDrawControls(el);
  });
});

Shiny.addCustomMessageHandler("showDrawControls", function (message) {
  withMapInstance(message.id, function (el) {
    showDrawControls(el);
  });
});

Shiny.addCustomMessageHandler("addDraw", function (message) {
  withMapInstance(message.id, function (el) {
    addDrawControl(
      el,
      message.position,
      message.modes,
      message.activeColour,
      message.inactiveColour,
      message.modeLabels
    );
  });
});

Shiny.addCustomMessageHandler("addZoomControl", function (message) {
  withMapInstance(message.id, function (el) {
    addZoomControl(el.mapInstance, message.position, message.controlOptions);
  });
});

Shiny.addCustomMessageHandler("addCustomControl", function (message) {
  withMapInstance(message.id, function (el) {
    addCustomControl(el.mapInstance, message.html, message.position);
  });
});

Shiny.addCustomMessageHandler("deleteDrawnShape", function (message) {
  withMapInstance(message.id, function (el) {
    deleteDrawnShape(el, message.shapeId);
  });
});

Shiny.addCustomMessageHandler("setMapBounds", function (message) {
  withMapInstance(message.id, function (el) {
    el.mapInstance.fitBounds(message.bounds, {
      padding: message.padding,
      maxZoom: message.maxZoom,
    });
  });
});

Shiny.addCustomMessageHandler("setSelectedTiles", function (message) {
  withMapInstance(message.id, function (el) {
    setTileLayer(el, message.tiles);
  });
});

Shiny.addCustomMessageHandler("addFilter", function (message) {
  withMapInstance(message.id, function (el) {
    addFilterToLayer(el.mapInstance, message.layerId, message.filter);
  });
});

Shiny.addCustomMessageHandler("toggleClustering", function (message) {
  withMapInstance(message.id, function (el) {
    toggleLayerClustering(el.mapInstance, message.layerId, message.cluster);
  });
});

Shiny.addCustomMessageHandler("addLayer", function (message) {
  withMapInstance(message.id, function (el) {
    addLayerToMap(el, message);
  });
});

Shiny.addCustomMessageHandler("hideLayer", function (message) {
  withMapInstance(message.id, function (el) {
    if (message.layerId !== "satellite") {
      /**
       * Satellite layer should always be visible as a backup, and is
       * under other layers if not the selected layer.
       */
      hideLayer(el.mapInstance, message.layerId);
    }
  });
});

Shiny.addCustomMessageHandler("showLayer", function (message) {
  withMapInstance(message.id, function (el) {
    showLayer(el.mapInstance, message.layerId);
  });
});

Shiny.addCustomMessageHandler("addImageSource", function (message) {
  withMapInstance(message.id, function (el) {
    addImageToMapSource(el.mapInstance, message.imageId, message.imageUrl);
  });
});

Shiny.addCustomMessageHandler("addMapSource", function (message) {
  withMapInstance(message.id, function (el) {
    el.mapInstance.addSource(message.sourceId, {
      type: message.type,
      data: message.data,
      cluster: message.cluster,
    });
  });
});

Shiny.addCustomMessageHandler("addFeatureServerSource", function (message) {
  withMapInstance(message.id, function (el) {
    addFeatureServerSource(el, message.sourceUrl, message.sourceId);
  });
});

Shiny.addCustomMessageHandler("updateSourceData", function (message) {
  withMapInstance(message.id, function (el) {
    const src = el.mapInstance.getSource(message.sourceId);
    if (src && src.setData) {
      src.setData(message.data);
    } else {
      console.warn(
        "Source not found or not a GeoJSON source:",
        message.sourceId
      );
    }
  });
});

Shiny.addCustomMessageHandler("setPaintProp", function (message) {
  withMapInstance(message.id, function (el) {
    el.mapInstance.setPaintProperty(
      message.layerId,
      message.property,
      message.value
    );
  });
});

Shiny.addCustomMessageHandler("setLayoutProp", function (message) {
  withMapInstance(message.id, function (el) {
    el.mapInstance.setLayoutProperty(
      message.layerId,
      message.property,
      message.value
    );
  });
});
