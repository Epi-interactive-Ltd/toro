# Render a MapLibre GL map in Shiny

Render a MapLibre GL map in Shiny

## Usage

``` r
renderMap(expr, env = parent.frame(), quoted = FALSE)
```

## Arguments

- expr:

  An expression that generates a map.

- env:

  The environment in which to evaluate `expr`.

- quoted:

  Is `expr` a quoted expression (with
  [`quote()`](https://rdrr.io/r/base/substitute.html))? This is useful
  if you want to save an expression in a variable.

## Value

A rendered MapLibre GL map for use in a Shiny server.

## Examples

``` r
if(interactive()){
library(shiny)
library(toro)

ui <- fluidPage(
 tagList(
   mapOutput("map")
 )
)
server <- function(input, output, session) {
 output$map <- renderMap({
   map()
 })
}
}
```
