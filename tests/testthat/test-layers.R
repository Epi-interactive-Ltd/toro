# Basic layer functionality
test_that("add_layer works with sf source", {
  skip_if_not_installed("sf")
  m <- map()
  result <- add_layer(m, id = "test", source = mock_sf)
  expect_identical(length(result$x$layers), 1L)
  expect_identical(result$x$layers[[1]]$id, "test")
  expect_identical(result$x$layers[[1]]$type, "fill")
})

test_that("add_layer accepts different layer types", {
  skip_if_not_installed("sf")
  m <- map()

  circle <- add_layer(m, id = "circle", type = "circle", source = mock_sf)
  expect_identical(circle$x$layers[[1]]$type, "circle")

  line <- add_layer(m, id = "line", type = "line", source = mock_sf)
  expect_identical(line$x$layers[[1]]$type, "line")

  symbol <- add_layer(m, id = "symbol", type = "symbol", source = mock_sf)
  expect_identical(symbol$x$layers[[1]]$type, "symbol")
})

# Specific layer type functions
test_that("add_fill_layer creates fill layer", {
  skip_if_not_installed("sf")
  m <- map()
  result <- add_fill_layer(m, id = "fill", source = mock_sf)
  expect_identical(result$x$layers[[1]]$type, "fill")
})

test_that("add_circle_layer creates circle layer", {
  skip_if_not_installed("sf")
  m <- map()
  result <- add_circle_layer(m, id = "circle", source = mock_sf)
  expect_identical(result$x$layers[[1]]$type, "circle")
})

test_that("add_line_layer creates line layer", {
  skip_if_not_installed("sf")
  m <- map()
  result <- add_line_layer(m, id = "line", source = mock_sf)
  expect_identical(result$x$layers[[1]]$type, "line")
})

test_that("add_symbol_layer creates symbol layer", {
  skip_if_not_installed("sf")
  m <- map()
  result <- add_symbol_layer(m, id = "symbol", source = mock_sf)
  expect_identical(result$x$layers[[1]]$type, "symbol")
})

test_that("add_text_layer creates text layer", {
  skip_if_not_installed("sf")
  m <- map()
  result <- add_text_layer(m, id = "text", source = mock_sf)
  expect_identical(result$x$layers[[1]]$type, "text")
})

# Layer options and properties
test_that("add_layer accepts optional parameters", {
  skip_if_not_installed("sf")
  m <- map()
  result <- add_layer(
    m,
    id = "test",
    source = mock_sf,
    popup_column = "value",
    hover_column = "id",
    can_cluster = TRUE
  )
  expect_identical(result$x$layers[[1]]$popupColumn, "value")
  expect_identical(result$x$layers[[1]]$hoverColumn, "id")
  expect_true(result$x$layers[[1]]$canCluster)
})

# Tile layer functionality
test_that("set_tile_layer sets tile correctly", {
  m <- map()
  result <- set_tile_layer(m, tiles = "satellite")
  expect_identical(result$x$initialTileLayer, "satellite")
})

test_that("get_tile_options returns expected tiles", {
  tiles <- get_tile_options()
  expect_type(tiles, "character")
  expect_true("satellite" %in% tiles)
  expect_true("lightgrey" %in% tiles)
})

# Additional layer management functions
test_that("show_layer shows layer via proxy", {
  # Create a proper mock session
  mock_session <- list(
    sendCustomMessage = function(type, message) {
      # Do nothing in test
    }
  )

  proxy <- list(
    id = "test_map",
    session = mock_session
  )
  class(proxy) <- "mapProxy"

  result <- show_layer(proxy, layer_id = "test_layer")

  expect_s3_class(result, "mapProxy")
})

test_that("hide_layer hides layer via proxy", {
  # Create a proper mock session
  mock_session <- list(
    sendCustomMessage = function(type, message) {
      # Do nothing in test
    }
  )

  proxy <- list(
    id = "test_map",
    session = mock_session
  )
  class(proxy) <- "mapProxy"

  result <- hide_layer(proxy, layer_id = "test_layer")

  expect_s3_class(result, "mapProxy")
})

test_that("toggle_clustering toggles clustering on layer", {
  # Create a proper mock session
  mock_session <- list(
    sendCustomMessage = function(type, message) {
      # Do nothing in test
    }
  )

  proxy <- list(
    id = "test_map",
    session = mock_session
  )
  class(proxy) <- "mapProxy"

  result <- toggle_clustering(proxy, layer_id = "points_layer")

  expect_s3_class(result, "mapProxy")
})
