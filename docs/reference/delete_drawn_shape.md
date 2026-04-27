# Delete a drawn shape from the map

The ID of the shape is provided by the draw control when a shape is
created.

## Usage

``` r
delete_drawn_shape(proxy, shape_id)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md)

- shape_id:

  The ID of the shape to delete

## Value

The map proxy object for chaining

## Examples

``` r
if (FALSE) { # \dontrun{
library(shiny)
library(toro)

ui <- fluidPage(
 tagList(
   mapOutput("map"),
   selectInput("shape_ids", "Drawn shape IDs", choices = NULL),
   actionButton("remove_drawn_shape", "Remove drawn shape")
 )
)
server <- function(input, output, session) {
 drawn_shape_ids <- reactiveVal(character())

 output$map <- renderMap({
   map() |>
    add_draw_control()
 })

 # Update the select input options with current shape IDs
 observe({
   req(input$map_loaded)
   updateSelectInput(inputId = "shape_ids", choices = drawn_shape_ids())
 })

 # Update the list of drawn shape IDs when a new shape is created
 observe({
   req(input$map_loaded, input$map_shape_created)
   new_shape <- get_drawn_shape(input$map_shape_created)
   drawn_shape_ids(c(drawn_shape_ids(), new_shape$id))
 }) |>
   bindEvent(input$map_shape_created)

 # Delete the selected drawn shape when the button is clicked
 observe({
   req(input$map_loaded, input$shape_ids)
   mapProxy("map") |>
     delete_drawn_shape(input$shape_ids)
   # Remove the deleted shape ID from the list of drawn shape IDs
   drawn_shape_ids(setdiff(drawn_shape_ids(), input$shape_ids))
 }) |>
   bindEvent(input$remove_drawn_shape)
}
} # }
```
