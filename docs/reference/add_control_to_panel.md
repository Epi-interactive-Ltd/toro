# Add a control to an existing control panel

Add a control to an existing control panel

## Usage

``` r
add_control_to_panel(
  map,
  panel_id,
  control_type,
  control_options = list(),
  section_title = NULL,
  group_id = NULL
)
```

## Arguments

- map:

  The map or map proxy object.

- panel_id:

  ID of the target control panel.

- control_type:

  Type of control ("timeline", "speed", "custom").

- control_options:

  Control-specific options.

- section_title:

  Optional section title for the control.

- group_id:

  Optional ID of the group to add the control to.

## Value

             The map or map proxy object for chaining.
