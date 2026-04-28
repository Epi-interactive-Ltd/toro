# Control panel tests

test_that("add_control_panel adds control panel to map", {
  m <- map()
  result <- add_control_panel(
    m,
    panel_id = "test_panel",
    title = "Test Panel",
    position = "top-left"
  )

  expect_s3_class(result, "htmlwidget")
  expect_true("controlPanels" %in% names(result$x))
  expect_identical(length(result$x$controlPanels), 1L)
  expect_identical(result$x$controlPanels[["test_panel"]]$panelId, "test_panel")
  expect_identical(
    result$x$controlPanels[["test_panel"]]$options$title,
    "Test Panel"
  )
  expect_identical(
    result$x$controlPanels[["test_panel"]]$options$position,
    "top-left"
  )
})

test_that("add_control_panel accepts optional styling", {
  m <- map()
  result <- add_control_panel(
    m,
    panel_id = "styled_panel",
    title = "Styled Panel",
    position = "bottom-right",
    collapsible = TRUE,
    collapsed = TRUE
  )

  expect_true(result$x$controlPanels[["styled_panel"]]$options$collapsible)
  expect_true(result$x$controlPanels[["styled_panel"]]$options$collapsed)
})

test_that("add_control_group adds control group to map", {
  m <- map()
  result <- add_control_group(
    m,
    group_id = "test_group",
    panel_id = "test_panel",
    group_title = "Test Group"
  )

  expect_s3_class(result, "htmlwidget")
  expect_true("controlPanels" %in% names(result$x))
  expect_true(!is.null(result$x$controlPanels[["test_panel"]]))
  expect_true(
    !is.null(result$x$controlPanels[["test_panel"]]$options$panelControls)
  )
  expect_identical(
    length(result$x$controlPanels[["test_panel"]]$options$panelControls),
    1L
  )

  # Check the group config
  group_config <- result$x$controlPanels[["test_panel"]]$options$panelControls[[
    1
  ]]
  expect_identical(group_config$groupId, "test_group")
  expect_identical(group_config$groupTitle, "Test Group")
})

test_that("add_control_group accepts optional parameters", {
  m <- map()
  result <- add_control_group(
    m,
    group_id = "styled_group",
    panel_id = "test_panel",
    group_title = "Styled Group",
    collapsible = TRUE,
    collapsed = FALSE
  )

  # Check the group config
  group_config <- result$x$controlPanels[["test_panel"]]$options$panelControls[[
    1
  ]]
  expect_true(group_config$collapsible)
  expect_false(group_config$collapsed)
})

test_that("remove_control_group removes group from map proxy", {
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

  result <- remove_control_group(proxy, group_id = "test_group")

  expect_s3_class(result, "mapProxy")
})
