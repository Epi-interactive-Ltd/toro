# Remove the zoom control from the map.

Remove the zoom control from the map.

## Usage

``` r
remove_zoom_control(proxy, panel_id = NULL)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- panel_id:

  Optional. If provided, removes the zoom control from the specified
  control panel. If NULL, removes the standalone zoom control.

## Value

         The map proxy object for chaining.
