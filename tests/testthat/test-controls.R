# General controls tests

test_that("toggle_control toggles control visibility", {
  mock_session <- list(
    sendCustomMessage = function(type, message) {
      # Do nothing in test
    }
  )

  proxy <- list(id = "test_map", session = mock_session)
  class(proxy) <- "mapProxy"

  result <- toggle_control(proxy, control_id = "test_control")

  expect_s3_class(result, "mapProxy")
})

test_that("remove_control removes control from map proxy", {
  mock_session <- list(
    sendCustomMessage = function(type, message) {
      # Do nothing in test
    }
  )

  proxy <- list(id = "test_map", session = mock_session)
  class(proxy) <- "mapProxy"

  result <- remove_control(proxy, control_id = "test_control")

  expect_s3_class(result, "mapProxy")
})

test_that("add_custom_control adds custom control to map", {
  m <- map()
  result <- add_custom_control(
    m,
    id = "custom1",
    html = "<button>Click me</button>",
    position = "top-right"
  )

  expect_s3_class(result, "htmlwidget")
  expect_true("controls" %in% names(result$x))
  expect_identical(length(result$x$controls), 1L)
  expect_identical(result$x$controls[[1]]$controlId, "custom1")
  expect_identical(result$x$controls[[1]]$type, "custom")
  expect_identical(result$x$controls[[1]]$position, "top-right")
})

test_that("add_custom_control accepts styling options", {
  m <- map()
  result <- add_custom_control(
    m,
    id = "custom2",
    html = "<div>Custom Control</div>",
    position = "bottom-left"
  )

  expect_identical(result$x$controls[[1]]$controlId, "custom2")
  expect_identical(result$x$controls[[1]]$position, "bottom-left")
})

test_that("remove_custom_control removes custom control from map proxy", {
  mock_session <- list(
    sendCustomMessage = function(type, message) {
      # Do nothing in test
    }
  )

  proxy <- list(id = "test_map", session = mock_session)
  class(proxy) <- "mapProxy"

  result <- remove_custom_control(proxy, control_id = "custom1")

  expect_s3_class(result, "mapProxy")
})

test_that("add_cursor_coords_control adds coordinate display to map", {
  m <- map()
  result <- add_cursor_coords_control(
    m,
    position = "bottom-right"
  )

  expect_s3_class(result, "htmlwidget")
  expect_identical(length(result$x$controls), 1L)
  expect_identical(result$x$controls[[1]]$type, "cursor")
  expect_identical(result$x$controls[[1]]$position, "bottom-right")
})

test_that("add_cursor_coords_control accepts formatting options", {
  m <- map()
  result <- add_cursor_coords_control(
    m,
    position = "top-left",
    long_label = "Longitude",
    lat_label = "Latitude"
  )

  expect_identical(result$x$controls[[1]]$longLabel, "Longitude")
  expect_identical(result$x$controls[[1]]$latLabel, "Latitude")
})

test_that("remove_cursor_coords_control removes coordinate control from map proxy", {
  mock_session <- list(
    sendCustomMessage = function(type, message) {
      # Do nothing in test
    }
  )

  proxy <- list(id = "test_map", session = mock_session)
  class(proxy) <- "mapProxy"

  result <- remove_cursor_coords_control(proxy)

  expect_s3_class(result, "mapProxy")
})
