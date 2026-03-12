# Remove the layer selector control from the map.

Remove the layer selector control from the map.

## Usage

``` r
remove_layer_selector_control(proxy, panel_id = NULL)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- panel_id:

  Optional. If provided, removes the layer selector control from the
  specified control panel. If NULL, removes the standalone layer
  selector control.

## Value

         The map proxy object for chaining.
