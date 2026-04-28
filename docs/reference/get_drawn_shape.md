# Get the drawn shape from the map widget

Parses the JSON string returned by the map widget when a shape is drawn.
Ensures that the ID of the shape is included in the resulting `sf`
object.

## Usage

``` r
get_drawn_shape(create_input_string)
```

## Arguments

- create_input_string:

  A JSON string representing the drawn shape

## Value

A `sf` object representing the drawn shape, or `NULL`

## Details

To get the drawn shape, use `input$map_shape_created` in a Shiny app,
where `map` is the ID of your map output. This input will contain a JSON
string representing the drawn shape whenever a new shape is created
using the draw control on the map. Pass this input to
`get_drawn_shape()` to convert it into an `sf` object for easier
manipulation in R.

## Examples

``` r
if (FALSE) { # \dontrun{
library(shiny)
library(toro)

ui <- fluidPage(
 tagList(
   mapOutput("map")
 )
)
server <- function(input, output, session) {
 output$map <- renderMap({
   map() |>
    add_draw_control()
 })

 # Update the list of drawn shape IDs when a new shape is created
 observe({
   req(input$map_loaded, input$map_shape_created)
   new_shape <- get_drawn_shape(input$map_shape_created)
   print(new_shape)
 }) |>
   bindEvent(input$map_shape_created)
}
} # }
```
