# Shiny integration tests

test_that("mapOutput creates shiny output binding", {
  output_id <- "test_map"
  result <- mapOutput(output_id, width = "100%", height = "400px")

  expect_s3_class(result, "shiny.tag.list")
  expect_true(length(result) > 0)
  # Should contain the output element with correct ID
  expect_true(any(grepl(output_id, as.character(result))))
})

test_that("mapOutput with custom dimensions", {
  result <- mapOutput("custom_map", width = "800px", height = "600px")

  expect_s3_class(result, "shiny.tag.list")
  expect_true(length(result) > 0)
  # Should contain custom width and height in the output
  result_str <- as.character(result)
  expect_true(any(grepl("800px", result_str)))
  expect_true(any(grepl("600px", result_str)))
})

test_that("renderMap creates shiny render function", {
  # Mock render function
  render_func <- renderMap({
    map() |>
      add_source(data = mock_sf, source_id = "test") |>
      add_layer(id = "test_layer", source = "test")
  })

  expect_type(render_func, "closure")
  expect_s3_class(render_func, "shiny.render.function")
})

test_that("renderMap with reactive data", {
  skip_if_not_installed("shiny")
  library(shiny)

  # Create mock reactive value
  mock_reactive <- reactive({
    mock_sf
  })

  render_func <- renderMap({
    data <- mock_reactive()
    map() |>
      add_source(data = data, source_id = "reactive") |>
      add_layer(id = "reactive_layer", source = "reactive")
  })

  expect_type(render_func, "closure")
})

test_that("mapProxy creates map proxy object", {
  proxy_id <- "test_map"
  proxy <- mapProxy(proxy_id)

  expect_s3_class(proxy, "mapProxy")
  expect_identical(proxy$id, proxy_id)
})

test_that("mapProxy with session", {
  skip_if_not_installed("shiny")
  library(shiny)

  # Mock session object
  mock_session <- list(
    sendCustomMessage = function(type, message) {
      list(type = type, message = message)
    }
  )

  proxy <- mapProxy("test_map", session = mock_session)

  expect_s3_class(proxy, "mapProxy")
  expect_identical(proxy$session, mock_session)
})
