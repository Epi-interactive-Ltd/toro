HTMLWidgets.widget({
  name: "map",
  type: "output",

  factory: function (el, width, height) {
    let mapInstance = null;

    return {
      renderValue: function (x) {
        if (typeof maplibregl === "undefined") {
          console.error("Maplibre GL JS not loaded.");
          return;
        }
        if (mapInstance) {
          mapInstance.remove();
        }
        // Clear the container
        el.innerHTML = "";

        // Create the map
        mapInstance = new maplibregl.Map({
          container: el.id,
          style: {
            version: 8,
            glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
            sources: {},
            layers: [],
          },
          center: x.center,
          zoom: x.zoom,
          ...x.options,
        });

        el.mapInstance = mapInstance; // Attach to the element for later access
        window[el.id] = mapInstance; // Store the instance globally for debugging
        el.widgetInstance = this;

        el.ourLayers = []; // Layers added by us
        el.tileLayers = [];

        // mapInstance.controls = [];
        // mapInstance.sources = [];

        // Add any images that need to be added to the map for pins/icons
        addImagesToMap(mapInstance, x.options.imageSources);

        if (HTMLWidgets.shinyMode) {
          /**
           * If the map is being used in Shiny, do a few things on load:
           * - Update Shiny inputs for the map's view properties
           */
          mapInstance.on(["load", "moveend"], function () {
            updateShinyView(el, mapInstance);
          });

          /**
           * Load only triggers once the map has fully loaded (one time).
           * Add any layers/sources needed after the map is fully loaded.
           * Also, update the Shiny input for the map's loaded state.
           */
          mapInstance.on("load", function () {
            if (x.sources) {
              x.sources.forEach((source) =>
                mapInstance.addSource(source.sourceId, source.sourceOptions)
              );
            }

            if (x.featureSources) {
              x.featureSources.forEach((featureSource) => {
                addFeatureServerSource(
                  el,
                  featureSource.sourceUrl,
                  featureSource.sourceId
                );
              });
            }

            if (x.imageSources) {
              x.imageSources.forEach((imageSource) =>
                addImageToMapSource(
                  mapInstance,
                  imageSource.imageId,
                  imageSource.imageUrl
                )
              );
            }

            initiateTiles(el, x);
            addSpiderfyingLayers(el.mapInstance);

            // new mapboxglEsriSources.TiledMapService(
            //   "imagery-source",
            //   mapInstance,
            //   {
            //     url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
            //   }
            // );
            // mapInstance.addLayer({
            //   id: "imagery-layer",
            //   type: "raster",
            //   source: "imagery-source",
            // });

            // new mapboxglEsriSources.TiledMapService(
            //   "natgeo-source",
            //   mapInstance,
            //   {
            //     url: "https://services.arcgisonline.com/arcgis/rest/services/NatGeo_World_Map/MapServer",
            //   }
            // );
            // mapInstance.addLayer({
            //   id: "natgeo-layer",
            //   type: "raster",
            //   source: "natgeo-source",
            // });

            if (x.layers) {
              x.layers.forEach((layer) => addLayerToMap(el, layer));
            }

            if (!x.options.enable3D) {
              disable3DView(el.mapInstance);
            }

            if (x.setBounds) {
              setMapBounds(
                mapInstance,
                x.setBounds.bounds,
                x.setBounds.maxZoom,
                x.setBounds.padding
              );
            }

            if (x.setZoom) {
              mapInstance.setZoom(x.setZoom);
            }

            if (x.latLngGrid) {
              addLatLngGrid(el, x.latLngGrid.gridColour);
            }

            if (x.cursorControls) {
              addCursorCoordinateControl(
                mapInstance,
                x.cursorControls.position,
                x.cursorControls.longLabel,
                x.cursorControls.latLabel
              );
            }

            if (x.zoomControl) {
              addZoomControl(
                mapInstance,
                x.zoomControl.position,
                x.zoomControl.controlOptions
              );
            }

            if (x.customControls) {
              x.customControls.forEach((control) => {
                addCustomControl(
                  mapInstance,
                  control.controlId,
                  control.html,
                  control.position
                );
              });
            }

            if (x.drawControl) {
              addDrawControl(
                el,
                x.drawControl.position,
                x.drawControl.modes,
                x.drawControl.activeColour,
                x.drawControl.inactiveColour,
                x.drawControl.modeLabels
              );
            }

            // Trigger a input event to notify Shiny that the map is loaded
            Shiny.setInputValue(el.id + "_loaded", Math.random(), {
              priority: "event",
            });

            closeAttribution(el.id); // By default, close the attribution panel
          });
        }

        // ------------------------------------------------------------

        el.maxZoom = x.options.maxZoom; // Set the max zoom level
        el.minZoom = x.options.minZoom; // Set the min zoom level
        el.draw = null;

        el.openClusterId = null; // ID of the currently open cluster

        el.clusterColour = x.options.clusterColour;

        el.initiallyLoaded =
          x.options.initialLoadedLayers == null ? true : false; // Track if the map was initially loaded without a loader

        if (!el.initiallyLoaded && x.options.initialLoadedLayers) {
          addMapLoader(
            el,
            false,
            x.options.initialLoaderBgColour,
            toRgbValues(x.options.initialLoaderColour)
          );
        }

        // el.mapInstance.on("load", function () {
        //   // mapInstance.addLayer({
        //   //   id: "background-blue",
        //   //   type: "background",
        //   //   paint: {
        //   //     "background-color": x.options.backgroundColour,
        //   //   },
        //   // });
        //   // initiateTiles(el, x.options.loadedTiles, x.options.initialTileLayer);
        //   // addSpiderfyingLayers(el.mapInstance);

        //   // if (!x.options.enable3D) {
        //   //   disable3DView(el.mapInstance);
        //   // }

        //   // // Trigger a input event to notify Shiny that the map is loaded
        //   // Shiny.setInputValue(el.id + "_loaded", Math.random(), {
        //   //   priority: "event",
        //   // });

        //   // closeAttribution(el.id);
        // });

        // Idle event when sources and layers are loaded
        if (!el.initiallyLoaded && x.options.initialLoadedLayers) {
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
          el.mapInstance.on("idle", initialMapLoaderHandler);
        } else if (el.initiallyLoaded) {
          el.mapInstance.off("idle", initialMapLoaderHandler);
        }
        if (x.options.spinnerWhileBusy) {
          function showSpinner() {
            addMapLoader(
              el,
              (changeLoader = true),
              x.options.busyLoaderBgColour,
              x.options.busyLoaderColour
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

function saveElementAsPng(elementId, filename = "capture.png") {
  var el = document.getElementById(elementId);
  html2canvas(el).then(function (canvas) {
    var link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL();
    link.click();
  });
}

async function exportElementBundled(elementId, filename = "bundle.html") {
  const el = document.getElementById(elementId);
  if (!el) return;

  // Collect all CSS and JS URLs
  const cssLinks = Array.from(
    document.head.querySelectorAll('link[rel="stylesheet"]')
  ).map((l) => l.href);
  const jsLinks = Array.from(document.head.querySelectorAll("script[src]")).map(
    (s) => s.src
  );

  // Fetch and inline CSS
  let cssContent = "";
  for (const url of cssLinks) {
    try {
      const resp = await fetch(url);
      cssContent += (await resp.text()) + "\n";
    } catch (e) {}
  }

  // Fetch and inline JS
  let jsContent = "";
  for (const url of jsLinks) {
    try {
      const resp = await fetch(url);
      jsContent += (await resp.text()) + "\n";
    } catch (e) {}
  }

  // Build HTML
  const html =
    "<!DOCTYPE html>\n<html>\n<head>\n" +
    `<style>\n${cssContent}\n</style>\n` +
    `<script>\n${jsContent}\n</script>\n` +
    "</head>\n<body>\n" +
    el.outerHTML +
    "\n</body>\n</html>";

  // Download
  const blob = new Blob([html], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function saveElementAsHtml(elementId, filename = "content.html") {
  var el = document.getElementById(elementId);
  if (el) {
    var html = el.outerHTML;
    var blob = new Blob([html], { type: "text/html" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

Shiny.addCustomMessageHandler("downloadMapImage", function (message) {
  withMapInstance(message.id, function (el) {
    console.log(message);
    console.log(el);
    // saveElementAsPng(el.id);
    // saveElementAsHtml(el.id);
    // exportElementBundled(el.id);

    // const element = document.querySelector("#" + el.id + ".html-widget"); // or any selector

    // setTimeout(function () {
    //   html2canvas(element).then((canvas) => {
    //     const imgData = canvas.toDataURL("image/png");
    //     // Create a download link:
    //     const link = document.createElement("a");
    //     link.href = imgData;
    //     link.download = "export.png";
    //     link.click();
    //   });
    // }, 1000);
  });
});

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

Shiny.addCustomMessageHandler("toggleLatLngGrid", function (message) {
  withMapInstance(message.id, function (el) {
    toggleLatLngGrid(el, (hide = message.show));
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
      message.options.position,
      message.options.modes,
      message.options.activeColour,
      message.options.inactiveColour,
      message.options.modeLabels
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
    addCustomControl(
      el.mapInstance,
      message.options.controlId,
      message.options.html,
      message.options.position
    );
  });
});

Shiny.addCustomMessageHandler("toggleControl", function (message) {
  withMapInstance(message.id, function (el) {
    toggleControl(el, message.controlId, message.show);
  });
});

Shiny.addCustomMessageHandler("deleteDrawnShape", function (message) {
  withMapInstance(message.id, function (el) {
    deleteDrawnShape(el, message.shapeId);
  });
});

Shiny.addCustomMessageHandler("setMapBounds", function (message) {
  withMapInstance(message.id, function (el) {
    setMapBounds(
      el.mapInstance,
      message.options.bounds,
      message.options.maxZoom,
      message.options.padding
    );
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
    el.mapInstance.addSource(message.sourceId, message.sourceOptions);
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
