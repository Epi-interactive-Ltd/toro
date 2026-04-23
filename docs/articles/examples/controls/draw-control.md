# Draw Controls

Draw controls can be added to a map to TODO

``` r

library(toro)

map() |>
  add_draw_control()
```

## Draw modes

Draw modes can be set by passing the `modes` parameter. By default the
draw mode is `polygon`. There is also `line`, `point`, and `delete`
modes you can add.

``` r

library(toro)

map() |>
  add_draw_control(modes=c("polygon", "line", "delete"))
```

For the polygon draw mode the shape is finished when you close the
polygon by clicking the dot of the point you started with.

For the line draw mode the shape is finished when you click on the last
draw point.

Using the delete mode you can delete drawn shapes from the map. To
delete a shape, first click on the shape you want to delete and then
click the delete button. If not using the delete mode, drawn shapes will
be static. This means that there will be not be editable and clicking on
the shape will only trigger an event to update the maps clicked feature
input. When using the delete mode, drawn shapes are editable when double
clicked (and deleteable via the delete button). To keep track of shapes
being updated via edits, you can watch the `<mapId>_shape_updated`
input. This input ID behaves the same way as the create shape event
except it is triggered when the user is finished editing an existing
shape (once they click outside of the shape and it is no longer in edit
mode).

## Retrieving drawn shapes in Shiny

``` r

library(shiny)
library(toro)

ui <- fluidPage(
  toro::mapOutput("map"),
  fluidRow(
    column(
      6,
      tagList(
        h2("Most Recently Created Shape"),
        verbatimTextOutput("created_shape")
      )
    ),
    column(
      6,
      tagList(
        h2("Most Recently Updated Shape"),
        verbatimTextOutput("updated_shape")
      )
    )
  ),
  h2("Most Recently Clicked Shape"),
  actionButton("delete_shape", "Delete clicked shape"),
  verbatimTextOutput("clicked_shape")
)

server <- function(input, output, session) {
  output$map <- toro::renderMap({
    toro::map() |>
      add_draw_control(modes = c("polygon", "line", "point", "delete"))
  })

  output$created_shape <- renderPrint({
    req(input$map_loaded)
    get_drawn_shape(input$map_shape_created)
  })

  output$updated_shape <- renderPrint({
    req(input$map_loaded)
    get_drawn_shape(input$map_shape_updated)
  })

  output$clicked_shape <- renderPrint({
    req(input$map_loaded)
    get_clicked_feature(input$map_feature_click)
  })

  observe({
    req(input$map_loaded)
    req(input$map_feature_click)
    req(input$map_feature_click$properties$id)
    delete_drawn_shape(
      mapProxy("map"),
      input$map_feature_click$properties$id
    )
  }) |>
    bindEvent(input$delete_shape)
}

if (interactive()) {
  shinyApp(ui, server)
}
```

## Draw control customisation

Customise the colour of drawn shapes using the `active_colour` and
`inactive_colour` parameters. The labels of the draw buttons can also be
changed using the `mode_labels` parameter.

``` r

library(toro)

map() |>
  add_draw_control(
    modes = c("polygon", "delete"),
    active_colour = "#20de60",
    inactive_colour = "#11A366",
    mode_labels = list(polygon = "Draw Polygon", delete = "Delete shape")
  )
```
