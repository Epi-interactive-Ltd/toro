# Add an image source to the map.

Add an image source to the map.

## Usage

``` r
add_image(map, image_id, image_url)
```

## Arguments

- map:

  The map or map proxy object.

- image_id:

  The ID of the image source.

- image_url:

  The URL of the image to add.

## Value

The map or map proxy object for chaining.

## Examples

``` r
if (FALSE) { # \dontrun{
image_url <- paste0(
 "https://upload.wikimedia.org/wikipedia/en/thumb/0/02/",
 "Leaf_icon.png/600px-Leaf_icon.png"
)

 map() |>
   add_image(
     image_id = "leaf-icon",
     image_url = image_url
   ) |>
   add_symbol_layer(
     id = "leaf_symbols",
     source = sf::st_as_sf(quakes, coords = c("long", "lat"), crs = 4326),
     layout = toro::get_layout_options(
       "symbol",
       options = list(
         icon_image = "leaf-icon",
         icon_size = 0.1
       )
     )
   )
} # }
```
