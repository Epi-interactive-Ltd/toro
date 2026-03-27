# Getting started with toro

## Installation

To install the development version from Github:

``` r
remotes::install_github("Epi-interactive-Ltd/toro")
```

Once installed, this package can be used in the R console and within
[Shiny](https://shiny.posit.co/) applications.

## Basic Usage

### Default Map

To create the default map widget just call the `map` function.

``` r
map()
```

### Customise With Map Options

By passing parameters to the `map` function you can customise several
features of the map.

``` r
map(
  style = "natgeo",
  center = c(174, -41),
  zoom = 2
)
```

### Adding Layers

You can add layers to the map using layer functions like
`add_symbol_layer`, `add_fill_layer`, etc.

For more detailed information see the [layers
vignette](https://epi-interactive-ltd.github.io/toro/articles/layers.html)

``` r
map() |>
  add_symbol_layer(
    id = "marker-layer",
    source = sf::st_as_sf(
      data.frame(lat = c(-41.306579555227245), long = c(174.82263228933076)),
      coords = c("long", "lat"),
      crs = 4326
    )
  )
```

## Where to Next?

It is highly recommended that you read through the [layers
vignette](https://epi-interactive-ltd.github.io/toro/articles/layers.html)
next.
