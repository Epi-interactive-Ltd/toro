# toro

**toro** is a package that provides [Maplibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) integration for R.

This version is built on R 4.5.2 and includes a function that lets you configure a custom maximum zoom level for satellite tile.

To learn how to use the package:

-

Examples can be found in the `examples` directory.

## Updates to the package

If any updates are made to the package it needs to be rebuilt:

```r
devtools::document()
devtools::install()
devtools::build()
```

If you are using the package in an app and copy the updated `.zip` file.
You will need to uninstall the old version of the package before installing the new one:

```r
remove.packages("toro")
remotes::install_github("Epi-interactive-Ltd/toro@feature/version-change", force = TRUE)
library(toro)
```

To add it as a local package to the `renv.lock` file: `renv::install("toro_<version>.tar.gz")`.

## TODOs

- [ ] Add more examples to the `examples` directory.
- [x] Split the `add_layer` function into smaller functions for each layer type (e.g., `add_polygon_layer`, `add_line_layer`, etc.).
