# Additional utility and control tests

# Control panel function that was missing
test_that("add_control_to_panel adds control to specific panel", {
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

  result <- add_control_to_panel(
    proxy,
    panel_id = "test_panel",
    control_type = "custom",
    control_options = list(html = "<div>Test Control</div>"),
    section_title = "Test Section",
    group_id = "test_group"
  )

  expect_s3_class(result, "mapProxy")
})

test_that("add_control_to_panel with positioning options", {
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

  result <- add_control_to_panel(
    proxy,
    panel_id = "main_panel",
    control_type = "timeline",
    control_options = list(startDate = "2024-01-01", endDate = "2024-12-31"),
    section_title = "Timeline Control",
    group_id = "controls_group"
  )

  expect_s3_class(result, "mapProxy")
})

# View control tests if any additional ones exist
test_that("set_zoom handles edge cases", {
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

  # Test minimum zoom
  result_min <- set_zoom(proxy, 0)
  expect_s3_class(result_min, "mapProxy")

  # Test maximum zoom
  result_max <- set_zoom(proxy, 24)
  expect_s3_class(result_max, "mapProxy")
})

test_that("set_bounds validates bounds format", {
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

  # Test with list format bounds
  bounds_list <- list(list(174.6, -36.9), list(174.9, -36.7)) # [[lon1, lat1], [lon2, lat2]]
  result <- set_bounds(proxy, bounds_list, padding = 50)

  expect_s3_class(result, "mapProxy")
})
