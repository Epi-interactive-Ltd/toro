# Create a MapLibre GL output for use in Shiny

Create a MapLibre GL output for use in Shiny

## Usage

``` r
mapOutput(outputId, width = "100%", height = "600px")
```

## Arguments

- outputId:

  output variable to read from

- width, height:

  Must be a valid CSS unit (like `'100%'`, `'400px'`, `'auto'`) or a
  number, which will be coerced to a string and have `'px'` appended

## Value

A MapLibre GL map for use in a Shiny UI
