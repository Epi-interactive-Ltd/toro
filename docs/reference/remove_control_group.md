# Remove a control group from a control panel

Remove a control group from a control panel

## Usage

``` r
remove_control_group(proxy, panel_id, group_id)
```

## Arguments

- proxy:

  The map proxy object created by
  [`mapProxy()`](https://epi-interactive-ltd.github.io/toro/reference/mapProxy.md).

- panel_id:

  The ID of the control panel.

- group_id:

  The ID of the control group to remove.

## Value

The map proxy object for chaining.

## Examples

``` r
if (FALSE) { # \dontrun{
library(shiny)
library(toro)

ui <- fluidPage(
 tagList(
   mapOutput("map"),
   actionButton("remove_group1", "Remove control group 1")
 )
)
server <- function(input, output, session) {
 output$map <- renderMap({
   map() |>
     add_control_panel(panel_id = "my_panel", title = "Map Settings") |>
     add_control_group(
       panel_id = "my_panel",
       group_id = "control_group1",
       group_title = "Control Group 1"
     ) |>
    add_control_group(
       panel_id = "my_panel",
       group_id = "control_group2",
       group_title = "Control Group 2"
     )
 })

 observe({
   req(input$map_loaded)
   mapProxy("map") |>
     remove_control_group(panel_id = "my_panel", group_id = "control_group1")
 }) |>
   bindEvent(input$remove_group1)
}
} # }
```
