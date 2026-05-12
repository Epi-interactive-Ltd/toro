# toro

Create interactive maps that can keep up with complex visualisations and
large datasets, with this useful interface to the [MapLibre GL
JS](https://maplibre.org/maplibre-gl-js/docs/) library. Users can create
maps directly in the console, or as an HTML widget within ‘Shiny’ web
applications, and render spatial data quickly with many customisable
options (clusters, custom icons, map layers, and backgrounds). The goal
of the package is to make it easier to interpret and explore large
spatial datasets within the context of a ‘Shiny’ dashboard, without
having long loading times waiting for a map to update with new data.

## Installation

Install from CRAN:

``` r

install.packages("toro")
```

Or, install the development version from
[GitHub](https://github.com/Epi-interactive-Ltd/toro):

``` r

# install.packages("remotes")
remotes::install_github("Epi-interactive-Ltd/toro")
```

## Documentation

Extensive documentation, guides, and examples will be available soon.

## Example

The most basic use case is as follows:

``` r

library(toro)
map()
```

More specific in-depth examples will be available soon.

## Licensing

This package is licensed under AGPL-3.
