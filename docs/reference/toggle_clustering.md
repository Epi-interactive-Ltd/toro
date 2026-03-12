# Toggle clustering for a layer on the map.

Toggle clustering for a layer on the map.

## Usage

``` r
toggle_clustering(proxy, layer_id, cluster = FALSE)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- layer_id:

  The ID of the layer to toggle clustering for.

- cluster:

  Whether to enable clustering. Default is `FALSE`.

## Value

         The map proxy object for chaining.
