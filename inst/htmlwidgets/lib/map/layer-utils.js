/**
 * Map layer utilities for MapLibre maps.
 *
 * - initiateTiles: Adds all necessary tiles to the map instance once it has loaded.
 * - addLayerToMap: Adds a layer to the map instance and handles popups, hovers, and clustering.
 * - addLayerOnFeatureClick: Adds a feature click event to a specific layer in a MapLibre map.
 * - setTileLayer: Sets the map tile layer based on the selected layer ID.
 * - hideLayer: Hides a specific layer in a MapLibre map.
 * - showLayer: Shows a specific layer in a MapLibre map.
 * - addNatGeoTiles: Adds the National Geographic World Map tiles to the MapLibre map.
 * - addTopoTiles: Adds the Topographic World Map tiles to the MapLibre map.
 * - addTerrainTiles: Adds the Terrain Map tiles to the MapLibre map.
 * - addStreetsTiles: Adds the Streets Map tiles to the MapLibre map.
 * - addShadedTiles: Adds the Shaded Map tiles to the MapLibre map.
 * - addSatelliteTiles: Adds the Satellite Imagery Map tiles to the MapLibre map.
 * - addFilterToLayer: Filters the data that appears in a specific layer of a MapLibre map.
 * - addLayerPopup: Adds a popup to a specific layer in a MapLibre map.
 * - addLayerHover: Adds a hover to a specific layer in a MapLibre map.
 * - addLayerCursor: Adds a cursor style to a specific layer on hover in a MapLibre map.
 * - copyLayerStyle: Copies the style from one layer to another in a MapLibre map.
 */

/**
 *  Add all necessary tiles to the map instance once it has loaded.
 *
 * @param {object} el         HTML widget element containing the map instance.
 * @param {object} mapParams  Map options containing loaded tiles and initial tile layer.
 * @returns {void}
 *
 * @see {@link hideLayer}
 * @see {@link showLayer}
 * @see {@link addSatelliteTiles}
 * @see {@link addTopoTiles}
 * @see {@link addNatGeoTiles}
 * @see {@link addTerrainTiles}
 * @see {@link addShadedTiles}
 * @see {@link addStreetsTiles}
 */
function initiateTiles(el, mapParams) {
  const loadedTiles = mapParams.options.loadedTiles || ["light-grey"];
  var initialTiles =
    mapParams.options.initialTileLayer || mapParams.style || null;
  const fallbackColour = mapParams.options.backgroundColour || "#FFFFFF";
  el.mapInstance.addLayer({
    id: "background-blue",
    type: "background",
    paint: {
      "background-color": fallbackColour,
    },
  });
  // First add all the tiles that are needed
  if (loadedTiles.includes("satellite")) {
    addSatelliteTiles(el.mapInstance);
    el.tileLayers.push("satellite");
    // Do not hide this layer by default
  }
  if (loadedTiles.includes("light-grey")) {
    addLightGreyTiles(el.mapInstance);
    el.tileLayers.push("light-grey");
    hideLayer(el.mapInstance, "light-grey");
  }
  if (loadedTiles.includes("topo")) {
    addTopoTiles(el.mapInstance);
    el.tileLayers.push("topo");
    hideLayer(el.mapInstance, "topo");
  }
  if (loadedTiles.includes("natgeo")) {
    addNatGeoTiles(el.mapInstance);
    el.tileLayers.push("natgeo");
    hideLayer(el.mapInstance, "natgeo");
  }
  if (loadedTiles.includes("terrain")) {
    addTerrainTiles(el.mapInstance);
    el.tileLayers.push("terrain");
    hideLayer(el.mapInstance, "terrain");
  }
  if (loadedTiles.includes("shaded")) {
    addShadedTiles(el.mapInstance);
    el.tileLayers.push("shaded");
    hideLayer(el.mapInstance, "shaded");
  }
  if (loadedTiles.includes("streets")) {
    addStreetsTiles(el.mapInstance);
    el.tileLayers.push("streets");
    hideLayer(el.mapInstance, "streets");
  }
  // if (loadedTiles.includes("bathymetric")) {
  //   addBathymetricTiles(el.mapInstance);
  //   el.tileLayers.push("bathymetric");
  //   hideLayer(el.mapInstance, "bathymetric");
  // }

  if (initialTiles == null) {
    initialTiles = el.tileLayers[0]; // Default to the first tile layer if none specified
  }
  // Make sure the initial tile layer is showing
  if (initialTiles && el.tileLayers.includes(initialTiles)) {
    showLayer(el.mapInstance, initialTiles);
  }
}

/**
 * Add a layer to the map instance.
 * Handle popups, hovers, and clustering for the layer.
 *
 * @param {object} el     Widget element containing the map instance.
 * @param {object} layer  Message containing layer options and other properties.
 * @returns {void}
 */
function addLayerToMap(el, layer) {
  const layerObj = {
    id: layer.id,
    type: layer.type,
    source: layer.source,
    layout: layer.layout || {},
    paint: layer.paint || {},
  };

  if (layer.filter) {
    layerObj.filter = layer.filter; // Add filter if specified
  }

  if (typeof layer.source === "object" && layer.source.type === "geojson") {
    layerObj.source.generateId = true;
  } else if (typeof layer.source === "string") {
    // Handle string source if needed
    layerObj.source = layer.source;
  }
  el.mapInstance.addLayer(layerObj, "spiderfy-lines");
  el.ourLayers.push(layerObj.id); // Store the layer ID for later reference

  if (layer.popupColumn) {
    addLayerPopup(el.mapInstance, layerObj.id, layer.popupColumn);
  }
  if (layer.hoverColumn) {
    addLayerHover(el.mapInstance, layerObj.id, layer.hoverColumn);
  }

  if (layer.canCluster) {
    addClusterLayer(el, layerObj.id, layer.source);
  }

  // if (layer.onFeatureClick) {
  addLayerOnFeatureClick(el, layerObj.id);
  // }
}

/**
 * Add a feature click event to a specific layer in a MapLibre map.
 *
 * @param {object} el       Widget element containing the map instance.
 * @param {string} layerId  Layer ID to add the feature click event to.
 * @returns {void}
 */
function addLayerOnFeatureClick(el, layerId) {
  if (HTMLWidgets.shinyMode) {
    el.mapInstance.on("click", layerId, (e) => {
      const feature = e.features[0];
      if (feature) {
        // Trigger a Shiny input event with the clicked feature's properties
        Shiny.setInputValue(`${el.id}_feature_click`, {
          layerId: layerId,
          properties: feature.properties,
          geometry: feature.geometry,
          time: new Date().toISOString(), // For multiple clicks on the same feature
        });
      }
    });
  }
}

/**
 * Set the map tile layer.
 *
 * @param {object} el       Widget element containing the map instance.
 * @param {string} layerId  Selected tile layer ID to set.
 * @returns {void}
 */
function setTileLayer(el, layerId) {
  // Check if it's an image Tile layer - want to keep the old selected tiles under it

  const currentTileSet = el.widgetInstance.getCurrentTiles();
  const isImageTile = el.widgetInstance
    .getAvailableImageLayerTiles()
    .includes(layerId);

  el.tileLayers.forEach(function (id) {
    var visibility = id === layerId ? "visible" : "none";
    if (id === "satellite" || (isImageTile && id === currentTileSet)) {
      visibility = "visible"; // Always show satellite layer underneath
    }
    el.mapInstance.setLayoutProperty(id, "visibility", visibility);
  });

  // Update any tile selector controls to reflect the current tile
  if (
    el.mapInstance._tileSelectorControl &&
    el.mapInstance._tileSelectorControl.setTile
  ) {
    const currentControlTile =
      el.mapInstance._tileSelectorControl.getCurrentTile();
    if (currentControlTile !== layerId) {
      const tileSelectorId = `tile-selector-${widgetInstance.getId()}`;
      // Use setTile method but without triggering the callback to avoid infinite loops
      const tileSelector = document.getElementById(tileSelectorId);
      if (tileSelector) {
        tileSelector.value = layerId;
      }
      // Directly update the stored current tile without triggering callback
      if (el.mapInstance._tileSelectorControl.getCurrentTile) {
        el.mapInstance._tileSelectorControl.currentTile = layerId;
      }
    }
  }
}

/**
 * Hide a specific layer in a MapLibre map.
 *
 * @param {object} map Maplibre map instance.
 * @param {string} layerId ID of the layer to hide.
 * @returns {void}
 */
function hideLayer(map, layerId) {
  const visibility = map.getLayoutProperty(layerId, "visibility");
  if (visibility !== "none" && layerId !== "satellite") {
    map.setLayoutProperty(layerId, "visibility", "none");
  }
}

/**
 * Show a specific layer in a MapLibre map.
 *
 * @param {object} map Maplibre map instance.
 * @param {string} layerId ID of the layer to show.
 * @returns {void}
 */
function showLayer(map, layerId) {
  const visibility = map.getLayoutProperty(layerId, "visibility");
  if (visibility !== "visible") {
    map.setLayoutProperty(layerId, "visibility", "visible");
  }
}

/**
 * Add the National Geographic World Map tiles to the MapLibre map.
 *
 * This is needed if the map tiles ever need to be changed to this tile set
 * regardless of what tiles show initially.
 *
 * @note The National Geographic world map tiles are only fully available up to
 *        zoom level 11. After that, the tiles in the middle of the ocean are blank.
 *        They can still zoom a bit further on land, but set this as max
 *        so that there are no blank tiles overall.
 *
 * @param {object} map A MapLibre map instance.
 * @returns {void}
 */
function addNatGeoTiles(map) {
  map.addSource("natgeo", {
    type: "raster",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
    ],
    tileSize: 256,
    attribution:
      "National Geographic, Esri, Garmin, HERE, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, increment P Corp.",
    maxzoom: 11,
  });
  map.addLayer({
    id: "natgeo",
    type: "raster",
    source: "natgeo",
    paint: {},
  });
}

/**
 * Add the Light Grey Map tiles to the MapLibre map.
 *
 * This is needed if the map tiles ever need to be changed to this tile set
 * regardless of what tiles show initially.
 *
 * @param {object} map A MapLibre map instance.
 * @returns {void}
 */
function addLightGreyTiles(map) {
  map.addSource("light-grey", {
    type: "raster",
    tiles: [
      "https://server.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    ],
    tileSize: 256,
    attribution:
      "Esri, HERE, Garmin, (c) OpenStreetMap contributors, and the GIS user community",
    maxzoom: 11,
  });
  map.addLayer({
    id: "light-grey",
    type: "raster",
    source: "light-grey",
    paint: {},
  });
}

function addTilesFromMapServer(
  widgetInstance,
  tileId,
  mapServiceUrl,
  ...options
) {
  const map = widgetInstance.getMap();
  map.addSource(tileId, {
    type: "raster",
    tiles: [mapServiceUrl + "/tile/{z}/{y}/{x}"],
    tileSize: 256,
    // attribution:
    //   "National Geographic, Esri, Garmin, HERE, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, increment P Corp.",
    maxzoom: options.maxZoom || 11,
  });
  map.addLayer({
    id: tileId,
    type: "raster",
    source: tileId,
    paint: {},
  });
  var availableTiles = widgetInstance.getAvailableTiles();

  if (!availableTiles.includes(tileId)) {
    availableTiles.push(tileId);
  }
  widgetInstance.setAvailableTiles(availableTiles);

  if (widgetInstance.getInitialTiles() !== tileId) {
    hideLayer(map, tileId);
  }
}

/**
 * Add all layers from the ArcGIS FeatureServer as a single combined source/layer.
 * Each feature gets a `zoom_id` property corresponding to its layer index.
 *
 * @param {object} el Widget element containing the map instance.
 * @param {string} gridColour Line color for the grid.
 * @returns {void}
 */
function addLatLngGrid(el, gridColour = "#000000") {
  // There are 4 layers
  const minZoomLevels = [0, 2.5, 3.5, 4.5];
  const maxZoomLevels = [2.5, 3.5, 4.5, 20];
  const baseUrl =
    "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Latitude_and_Longitude_Grids/FeatureServer";
  fetch(baseUrl + "?f=json")
    .then((response) => response.json())
    .then((serviceInfo) => {
      if (!serviceInfo.layers) return;
      // Fetch all layers in parallel
      return Promise.all(
        serviceInfo.layers.map((layer) => {
          const layerId = layer.id;
          if (layerId > 3) return Promise.resolve(); // Skip layers beyond 3
          const queryUrl = `${baseUrl}/${layerId}/query?where=1=1&outFields=*&f=geojson`;
          return fetch(queryUrl)
            .then((response) => response.json())
            .then((data) => {
              // Add zoom_id property to each feature
              if (data && data.features) {
                const combined = {
                  type: "FeatureCollection",
                  features: data.features,
                };
                el.mapInstance.addSource(`lat-lng-grid${layerId}`, {
                  type: "geojson",
                  data: combined,
                });
                el.mapInstance.addLayer(
                  {
                    id: `lat-lng-grid-zoom${layerId}`,
                    type: "line",
                    source: `lat-lng-grid${layerId}`,
                    paint: {
                      "line-color": gridColour,
                      "line-width": 1,
                      "line-opacity": 0.6,
                    },
                    maxzoom: maxZoomLevels[layerId],
                    minzoom: minZoomLevels[layerId],
                  },
                  el.ourLayers[0] // Add before any other layer added by user
                );
                el.ourLayers.push(`lat-lng-grid-zoom${layerId}`);
              }
            });
        })
      );
    });
}

/**
 * Hide or show the lat/lng grid layers on the map.
 * Does nothing if the layers are not present.
 *
 * @param {object} el     Widget element containing the map instance.
 * @param {boolean} show  Hide or show the lat/lng grid layers.
 * @returns {void}
 */
function toggleLatLngGrid(el, show) {
  el.ourLayers.forEach((layerId) => {
    if (layerId.startsWith("lat-lng-grid-zoom")) {
      const visibility = show === true ? "visible" : "none";
      el.mapInstance.setLayoutProperty(layerId, "visibility", visibility);
    }
  });
}

/**
 * Add the Topographic World Map tiles to the MapLibre map.
 *
 * This is needed if the map tiles ever need to be changed to this tile set
 * regardless of what tiles show initially.
 *
 * @note The Topographic world map tiles are only fully available up to
 *        zoom level 14. After that, the tiles in the middle of the ocean are blank.
 *        They can still zoom a bit further on land, but set this as max
 *        so that there are no blank tiles overall.
 *
 * @param {object} map A MapLibre map instance.
 * @returns {void}
 */
function addTopoTiles(map) {
  map.addSource("topo", {
    type: "raster",
    tiles: [
      "https://server.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    ],
    tileSize: 256,
    attribution:
      "Sources: Esri, HERE, Garmin, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), (c) OpenStreetMap contributors, and the GIS User Community",
    maxzoom: 14,
  });
  map.addLayer({
    id: "topo",
    type: "raster",
    source: "topo",
    paint: {},
  });
}

/**
 * Add the Terrain Map tiles to the MapLibre map.
 *
 * This is needed if the map tiles ever need to be changed to this tile set
 * regardless of what tiles show initially.
 *
 * @note The Terrain world map tiles are only fully available up to
 *        zoom level 8. After that, the tiles in the middle of the ocean are blank.
 *        They can still zoom a bit further on land, but set this as max
 *        so that there are no blank tiles overall.
 *
 * @param {object} map A MapLibre map instance.
 * @returns {void}
 */
function addTerrainTiles(map) {
  map.addSource("terrain", {
    type: "raster",
    tiles: [
      "https://server.arcgisonline.com/arcgis/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
    ],
    tileSize: 256,
    attribution: "Sources: Esri, USGS, NOAA",
    maxzoom: 8,
  });
  map.addLayer({
    id: "terrain",
    type: "raster",
    source: "terrain",
    paint: {},
  });
}

/**
 * Add the Streets Map tiles to the MapLibre map.
 *
 * This is needed if the map tiles ever need to be changed to this tile set
 * regardless of what tiles show initially.
 *
 * @note The Streets world map tiles are only fully available up to
 *        zoom level 14. After that, the tiles in the middle of the ocean are blank.
 *        They can still zoom a bit further on land, but set this as max
 *        so that there are no blank tiles overall.
 *
 * @param {object} map A MapLibre map instance.
 *
 * @param {object} map A MapLibre map instance.
 * @returns {void}
 */
function addStreetsTiles(map) {
  map.addSource("streets", {
    type: "raster",
    tiles: [
      "https://server.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    ],
    tileSize: 256,
    attribution:
      "Sources: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, (c) OpenStreetMap contributors, and the GIS User Community",
    maxzoom: 14,
  });
  map.addLayer({
    id: "streets",
    type: "raster",
    source: "streets",
    paint: {},
  });
}

/**
 * Add the Shaded Map tiles to the MapLibre map.
 *
 * This is needed if the map tiles ever need to be changed to this tile set
 * regardless of what tiles show initially.
 *
 * @note The shaded world map tiles are only fully available up to
 *        zoom level 12. After that, the tiles in the middle of the ocean are blank.
 *        They can still zoom a bit further on land, but set this as max
 *        so that there are no blank tiles overall.
 *
 * @param {object} map A MapLibre map instance.
 * @returns {void}
 */
function addShadedTiles(map) {
  map.addSource("shaded", {
    type: "raster",
    tiles: [
      "https://server.arcgisonline.com/arcgis/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",
    ],
    tileSize: 256,
    attribution: "Copyright:(c) 2014 Esri",
    maxzoom: 12,
  });
  map.addLayer({
    id: "shaded",
    type: "raster",
    source: "shaded",
    paint: {},
  });
}

/**
 * Add the Satellite Imagery Map tiles to the MapLibre map.
 *
 * This is needed if the map tiles ever need to be changed to this tile set
 * regardless of what tiles show initially.
 *
 * @note The Satellite map tiles are only available up to zoom level 12.
 *        After that, the tiles in the middle of the ocean are blank.
 *        They can still zoom a bit further on land, but set this as max
 *        so that there are no blank tiles overall.
 *
 * @param {object} map A MapLibre map instance.
 * @returns {void}
 */
function addSatelliteTiles(map) {
  map.addSource("satellite", {
    type: "raster",
    tiles: [
      "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    tileSize: 256,
    attribution:
      "Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    maxzoom: 12,
  });
  map.addLayer({
    id: "satellite",
    type: "raster",
    source: "satellite",
    paint: {},
  });
}

/**
 * Filter the data that appears in a specific layer of a MapLibre map.
 *
 * @param {object} map      A MapLibre map instance.
 * @param {string} layerId  Layer ID to filter data for.
 * @param {string[]} filter Filter to apply to the layer.
 * @returns {void}
 */
function addFilterToLayer(map, layerId, filter) {
  map.setFilter(layerId, filter);
}

/**
 * Add a popup to a specific layer in a MapLibre map.
 *
 * @param {object} map          Maplibre map instance.
 * @param {string} layerId      ID of the layer to add a popup to.
 * @param {string} popupColumn  Column name in the layer's properties to use for the popup content.
 */
function addLayerPopup(map, layerId, popupColumn) {
  map.on("click", layerId, (e) => {
    // Close any existing popups before opening a new one
    closeAllPopups(map);

    let coordinates = e.features[0].geometry.coordinates.slice();
    const description = e.features[0].properties[popupColumn];

    const featureType = e.features[0].geometry.type;

    if (!coordinates || featureType !== "Point") {
      // For non-Point geometries (LineString, Polygon), extract first coordinate pair
      if (!coordinates || featureType !== "Point") {
        // Fallback to clicked location if no coordinates available
        coordinates = [e.lngLat.lng, e.lngLat.lat];
      }
    }

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    const popup = new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
    map._popup = popup;
  });

  addLayerCursor(map, [layerId]);
}

/**
 * Add a hover to a specific layer in a MapLibre map.
 *
 * @param {object} map          Maplibre map instance.
 * @param {string} layerId      ID of the layer to add a hover to.
 * @param {string} hoverColumn  Column name in the layer's properties to use for the hover content.
 */
function addLayerHover(map, layerId, hoverColumn) {
  let popup;
  map.on("mouseenter", layerId, (e) => {
    map.getCanvas().style.cursor = "pointer";
    const coordinates = e.lngLat;
    const description = e.features[0].properties[hoverColumn];

    popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
    })
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
  });

  map.on("mousemove", layerId, (e) => {
    if (popup) {
      const coordinates = e.lngLat;
      const description = e.features[0].properties[hoverColumn];
      popup.setLngLat(coordinates).setHTML(description); // update both position and content
    }
  });

  map.on("mouseleave", layerId, () => {
    map.getCanvas().style.cursor = "";
    if (popup) {
      popup.remove();
      popup = null;
    }
  });
}

/**
 * Add a cursor style to a specific layer on hover in a MapLibre map.
 *
 * @param {object} map                      Maplibre map instance.
 * @param {string[]} layerIds               Array of layer IDs to add the cursor style to.
 * @param {string} [cursorStyle="pointer"]  The cursor style to apply when hovering over the layer(s).
 * @returns {void}
 */
function addLayerCursor(map, layerIds, cursorStyle = "pointer") {
  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on("mouseenter", layerIds, () => {
    map.getCanvas().style.cursor = cursorStyle;
  });

  // Change it back to a pointer when it leaves.
  map.on("mouseleave", layerIds, () => {
    map.getCanvas().style.cursor = "";
  });
}

/**
 * Copy the style from one layer to another in a MapLibre map.
 *
 * @param {object} map Maplibre map instance.
 * @param {string} fromLayerId ID of the layer to copy style from.
 * @param {string} toLayerId ID of the layer to copy style to.
 * @returns {void}
 */

/**
 * Close all open popups on the map.
 * This function closes both click-based popups (stored in map._popup) and any other popups that may exist.
 *
 * @param {object} map - Maplibre map instance.
 */
function closeAllPopups(map) {
  // Close the main popup stored in map._popup (from addLayerPopup clicks)
  if (map._popup && map._popup.isOpen()) {
    map._popup.remove();
    map._popup = null;
  }

  // Close any other popups that might exist on the map
  // Note: This covers any popups created by other parts of the code
  const popups = document.querySelectorAll(".maplibregl-popup");
  popups.forEach((popupElement) => {
    const popup = popupElement._popup;
    if (popup && popup.isOpen && popup.isOpen()) {
      popup.remove();
    } else {
      // Fallback: remove the DOM element directly if popup object is not accessible
      popupElement.remove();
    }
  });
}

function copyLayerStyle(map, fromLayerId, toLayerId) {
  const fromLayer = map.getLayer(fromLayerId);
  if (!fromLayer) return;

  // Copy paint properties
  const paintProps =
    map.getStyle().layers.find((l) => l.id === fromLayerId).paint || {};
  Object.keys(paintProps).forEach((prop) => {
    const value = map.getPaintProperty(fromLayerId, prop);
    map.setPaintProperty(toLayerId, prop, value);
  });

  // Copy layout properties
  const layoutProps =
    map.getStyle().layers.find((l) => l.id === fromLayerId).layout || {};
  Object.keys(layoutProps).forEach((prop) => {
    const value = map.getLayoutProperty(fromLayerId, prop);
    map.setLayoutProperty(toLayerId, prop, value);
  });
}
