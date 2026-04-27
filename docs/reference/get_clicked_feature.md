# Get the sf data frame of a clicked feature from the map widget

The click input is a list containing the `layerId`, `properties`,
`geometry`, and `time`. Turn this into an `sf` object.

## Usage

``` r
get_clicked_feature(clicked_feature_input)
```

## Arguments

- clicked_feature_input:

  A list representing the clicked feature

## Value

A `sf` object representing the clicked feature, or `NULL`

## Details

To get the clicked feature, use `input$map_feature_click` in a Shiny
app, where `map` is the ID of your map output. This input will contain a
list representing the clicked feature whenever a feature is clicked on
the map. Pass this input to `get_clicked_feature()` to convert it into
an `sf` object for easier manipulation in R.

## Note

`time` is not used in this function, but it is included in the input so
that the same feature can be clicked multiple times and the changed time
means that the input will be updated

## Examples

``` r
if (FALSE) { # \dontrun{
library(shiny)
library(spData)
library(sf)
library(toro)

nz_data <- spData::nz_height |>
  sf::st_transform(4326)

ui <- fluidPage(
 tagList(
   mapOutput("map")
 )
)
server <- function(input, output, session) {
 output$map <- renderMap({
   map() |>
     set_bounds(bounds = nz_data) |>
     add_circle_layer(
       id = "nz_elevation",
       source = nz_data
     )
 })

 # Print the clicked feature as an sf object
 observe({
   req(input$map_loaded, input$map_feature_click)
   print(get_clicked_feature(input$map_feature_click))
 }) |>
   bindEvent(input$map_feature_click)
}
} # }
```
