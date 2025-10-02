function interpolateLine(start, end, steps) {
  const points = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1); // fraction along the line
    const lon = start[0] + t * (end[0] - start[0]);
    const lat = start[1] + t * (end[1] - start[1]);
    points.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [lon, lat] },
      properties: {},
    });
  }
  return points;
}

function addRoute(map, routeOptions) {
  console.log(routeOptions);
  const points = routeOptions.points;
  const options = routeOptions.options || {};
  const routeId = routeOptions.routeId || "route";
  const routeLineLayerId = `${routeId}_route_line`;
  const routePointLayerId = `${routeId}_route_point`;

  const coords = points.features.map((f) => f.geometry.coordinates);

  const line = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: coords,
    },
    properties: {},
  };

  const route = {
    type: "FeatureCollection",
    features: [line],
  };
  // A single point that animates along the route.
  // Coordinates are initially set to origin.
  const point = {
    type: "FeatureCollection",
    features: [points.features[0]],
  };
  map.addLayer({
    id: routeLineLayerId,
    type: "line",
    source: {
      type: "geojson",
      data: route,
    },
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#888",
      "line-width": 6,
    },
  });
  map.addLayer({
    id: routePointLayerId,
    type: "circle",
    source: {
      type: "geojson",
      data: point,
    },
    paint: {
      "circle-color": "#B42222",
      "circle-radius": 7,
    },
  });

  // Number of steps to use in the arc and animation, more steps means
  // a smoother arc and animation, but too many steps will result in a
  // low frame rate
  var steps = options.steps || 500;

  // Used to increment the value of the point measurement against the route.
  let counter = 0;

  // Total length in kilometers
  const totalLength = turf.length(line, { units: "kilometers" });

  const linePoints = [];

  for (let i = 0; i < coords.length - 1; i++) {
    const lineSeg = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [coords[i], coords[i + 1]],
      },
      properties: {},
    };
    const lineLength = turf.length(lineSeg, { units: "kilometers" });
    const segmentSteps = steps * (lineLength / totalLength);
    const segmentLinePoints = interpolateLine(
      coords[i],
      coords[i + 1],
      segmentSteps
    );
    linePoints.push(...segmentLinePoints);
  }

  function animate() {
    if (counter >= linePoints.length) return; // stop if past last index
    // Update point geometry to a new position based on counter denoting
    // the index to access the arc.
    // console.log(counter);
    point.features[0].geometry.coordinates =
      linePoints[counter].geometry.coordinates;

    // Update the source with this new data.
    map.getSource(routePointLayerId).setData(point);

    counter += 1;
    requestAnimationFrame(animate);
  }

  animate();
}

function animateRoute(map, routeOptions) {
  const options = routeOptions.options || {};
  const routeId = options.routeId || "route";
  const routeLineLayerId = `${routeId}_route-line`;
  const routePointLayerId = `${routeId}_route-point`;

  // Number of steps to use in the arc and animation, more steps means
  // a smoother arc and animation, but too many steps will result in a
  // low frame rate
  var steps = options.steps || 500;
  console.log(options);

  // Used to increment the value of the point measurement against the route.
  let counter = 0;

  // Total length in kilometers
  const totalLength = turf.length(line, { units: "kilometers" });

  const linePoints = [];

  for (let i = 0; i < coords.length - 1; i++) {
    const lineSeg = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [coords[i], coords[i + 1]],
      },
      properties: {},
    };
    const lineLength = turf.length(lineSeg, { units: "kilometers" });
    const segmentSteps = steps * (lineLength / totalLength);
    const linePoints = interpolateLine(coords[i], coords[i + 1], segmentSteps);
    linePoints.push(...linePoints);
  }

  function animate() {
    if (counter >= linePoints.length) return; // stop if past last index
    // Update point geometry to a new position based on counter denoting
    // the index to access the arc.
    // console.log(counter);
    point.features[0].geometry.coordinates =
      linePoints[counter].geometry.coordinates;

    // Update the source with this new data.
    map.getSource(routePointLayerId).setData(point);

    counter += 1;
    requestAnimationFrame(animate);
  }

  animate();
}
