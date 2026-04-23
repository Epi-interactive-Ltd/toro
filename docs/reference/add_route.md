# Add a route to a toro map.

Add a route to a toro map.

## Usage

``` r
add_route(map, route_id, points, settings = list())
```

## Arguments

- map:

  A toro map object or a map proxy object.

- route_id:

  A unique identifier for the route.

- points:

  A sf object containing the points of the route.

- settings:

  A list of settings for the route (e.g., color, weight).

## Value

         The updated map object.
