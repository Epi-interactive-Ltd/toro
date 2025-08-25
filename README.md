# maplibReGL

Maplibre GL JS integration for R

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
detach("package:maplibReGL", unload = TRUE)
install.packages("maplibReGL_<version>.tar.gz", repos = NULL, type = "source")
library(maplibReGL)
```

To add it as a local package to the `renv.lock` file: `renv::install("maplibReGL_<version>.tar.gz")`.

## TODOs

- [ ] Add more examples to the `examples` directory.
- [x] Split the `add_layer` function into smaller functions for each layer type (e.g., `add_polygon_layer`, `add_line_layer`, etc.).
