# Basic functionality tests
test_that("set_tile_layer sets tiles correctly", {
  m <- map()
  m2 <- set_tile_layer(m, tiles = "satellite")
  expect_s3_class(m2, "htmlwidget")
  expect_equal(m2$x$initialTileLayer, "satellite")
})

test_that("get_tile_options returns valid tile options", {
  tiles <- get_tile_options()
  expect_type(tiles, "character")
  expect_true(length(tiles) > 0)

  # Check for expected tile types
  expected_tiles <- c(
    "natgeo",
    "satellite",
    "topo",
    "terrain",
    "streets",
    "shaded",
    "lightgrey"
  )
  expect_true(all(expected_tiles %in% tiles))
})

test_that("set_tile_layer works with different tile types", {
  tiles <- get_tile_options()
  m <- map()

  for (tile in tiles) {
    result <- set_tile_layer(m, tiles = tile)
    expect_s3_class(result, "htmlwidget")
    expect_equal(result$x$initialTileLayer, tile)
  }
})

test_that("set_tile_layer works with map proxy", {
  # Create a mock session for testing proxy functionality
  mock_session <- list(
    sendCustomMessage = function(type, message) {
      expect_equal(type, "setSelectedTiles")
      expect_true("id" %in% names(message))
      expect_true("tiles" %in% names(message))
      expect_equal(message$tiles, "satellite")
    }
  )

  proxy <- list(
    id = "test_map",
    session = mock_session,
    x = list()
  )
  class(proxy) <- "mapProxy"

  result <- set_tile_layer(proxy, tiles = "satellite")
  expect_s3_class(result, "mapProxy")
  expect_equal(result$x$initialTileLayer, "satellite")
})

test_that("map function accepts tile-related parameters", {
  # Test with custom style
  m1 <- map(style = "satellite")
  expect_s3_class(m1, "htmlwidget")
  expect_equal(m1$x$style, "satellite")

  # Test with loaded tiles
  tiles <- get_tile_options()
  m2 <- map(loadedTiles = tiles)
  expect_s3_class(m2, "htmlwidget")
  expect_equal(m2$x$options$loadedTiles, tiles)

  # Test with initial tile layer
  m3 <- map(initialTileLayer = "terrain")
  expect_s3_class(m3, "htmlwidget")
  expect_equal(m3$x$options$initialTileLayer, "terrain")
})

test_that("map function works with named list of tile options", {
  tile_options <- list(
    satellite = list(maxZoom = 12),
    lightgrey = list(maxZoom = 18)
  )

  m <- map(loadedTiles = tile_options)
  expect_s3_class(m, "htmlwidget")
  expect_equal(m$x$options$loadedTiles, tile_options)
})
test_that("set_tile_layer preserves other map properties", {
  m <- map(
    center = c(175, -40),
    zoom = 5,
    style = "lightgrey"
  )

  m2 <- set_tile_layer(m, tiles = "satellite")

  expect_s3_class(m2, "htmlwidget")
  expect_equal(m2$x$initialTileLayer, "satellite")
  expect_equal(m2$x$center, c(175, -40))
  expect_equal(m2$x$zoom, 5)
  expect_equal(m2$x$style, "lightgrey")
})

test_that("set_tile_layer returns map for chaining", {
  m <- map()

  # Test that the function returns the map object for chaining
  result <- m |>
    set_tile_layer(tiles = "terrain") |>
    set_tile_layer(tiles = "satellite")

  expect_s3_class(result, "htmlwidget")
  expect_equal(result$x$initialTileLayer, "satellite")
})

test_that("tile functions handle edge cases", {
  # Test with NULL
  m <- map()
  expect_no_error(set_tile_layer(m, tiles = NULL))

  # Test with invalid tile name (should still work, may be custom)
  expect_no_error(set_tile_layer(m, tiles = "custom_tile"))

  # Test with empty string
  expect_no_error(set_tile_layer(m, tiles = ""))
})

test_that("get_tile_options is consistent", {
  tiles1 <- get_tile_options()
  tiles2 <- get_tile_options()

  expect_identical(tiles1, tiles2)
  expect_true(length(tiles1) == 7) # Based on the implementation
})

test_that("map respects default tile behavior", {
  # Test default behavior
  m1 <- map()
  expect_s3_class(m1, "htmlwidget")
  expect_equal(m1$x$style, "lightgrey") # default style
  expect_true("lightgrey" %in% m1$x$options$loadedTiles)
  expect_true("satellite" %in% m1$x$options$loadedTiles) # default loaded tiles

  # Test that style is automatically added to loaded tiles
  m2 <- map(style = "natgeo", loadedTiles = c("satellite", "terrain"))
  expect_true("natgeo" %in% m2$x$options$loadedTiles)
  expect_true("satellite" %in% m2$x$options$loadedTiles)
  expect_true("terrain" %in% m2$x$options$loadedTiles)
})

test_that("tile layer setting with multiple simultaneous layers", {
  m <- map()

  # Test chaining multiple set_tile_layer calls
  result <- m |>
    set_tile_layer(tiles = "satellite") |>
    set_tile_layer(tiles = "natgeo") |>
    set_tile_layer(tiles = "terrain")

  expect_s3_class(result, "htmlwidget")
  expect_equal(result$x$initialTileLayer, "terrain")
})
