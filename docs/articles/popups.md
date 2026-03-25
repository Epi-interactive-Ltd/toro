# popups

When adding a layer you can include for the ability for that layer to
have popups.

``` r

map() |>
  add_symbol_layer(
    id = "marker-layer",
    source = sf::st_as_sf(
      data.frame(lat = c(-41.306579555227245), long = c(174.82263228933076), popup = c("Hello!")),
      coords = c("long", "lat"),
      crs = 4326
    ),
    popup_column = "popup"
  )
```
