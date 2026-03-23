# Remove a cluster toggle control from the map

Remove a cluster toggle control from the map

## Usage

``` r
remove_cluster_toggle(proxy, layer_id, panel_id = NULL)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- layer_id:

  The ID of the layer whose cluster toggle control to remove.

- panel_id:

  Optional. If provided, removes the control from the specified control
  panel.

## Value

The map proxy object for chaining.
