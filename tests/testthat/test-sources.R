# Basic functionality tests
test_that("map function creates htmlwidget", {
  m <- map()
  expect_s3_class(m, "htmlwidget")
  expect_true("x" %in% names(m))
})

# Basic source functionality
test_that("add_source adds a geojson source", {
  skip_if_not_installed("sf")
  m <- map()
  result <- add_source(m, source_id = "test_source", data = mock_sf)
  expect_identical(length(result$x$sources), 1L)
  expect_identical(result$x$sources[[1]]$sourceId, "test_source")
  expect_identical(result$x$sources[[1]]$sourceOptions$type, "geojson")
})

test_that("add_source accepts different source types", {
  skip_if_not_installed("sf")
  m <- map()

  # Test vector source type
  result <- add_source(
    m,
    source_id = "vector_test",
    data = mock_sf,
    type = "vector"
  )
  expect_identical(result$x$sources[[1]]$sourceOptions$type, "vector")

  # Test raster source type
  result2 <- add_source(
    m,
    source_id = "raster_test",
    data = mock_sf,
    type = "raster"
  )
  expect_identical(result2$x$sources[[1]]$sourceOptions$type, "raster")
})

test_that("add_source clustering option works", {
  skip_if_not_installed("sf")
  m <- map()
  result <- add_source(
    m,
    source_id = "cluster_test",
    data = mock_sf,
    cluster = TRUE
  )
  expect_true(result$x$sources[[1]]$sourceOptions$cluster)
})


# Feature server source
test_that("add_feature_server_source creates correct source", {
  m <- map()
  test_url <- "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Latitude_and_Longitude_Grids/FeatureServer"
  result <- add_feature_server_source(
    m,
    source_url = test_url,
    source_id = "feature_test"
  )

  expect_identical(length(result$x$sources), 1L)
  expect_identical(result$x$sources[[1]]$sourceId, "feature_test")
  expect_identical(result$x$sources[[1]]$sourceOptions$type, "geojson")
  # Test that URL contains the base URL
  expect_true(grepl(
    test_url,
    result$x$sources[[1]]$sourceOptions$data,
    fixed = TRUE
  ))
})

test_that("add_feature_server_source appends query url correctly", {
  m <- map()
  test_url <- "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Latitude_and_Longitude_Grids/FeatureServer"
  custom_query <- "/0/query?where=1=1&outFields=*&f=geojson"
  result <- add_feature_server_source(
    m,
    source_url = test_url,
    source_id = "feature_test",
    append_query_url = custom_query
  )

  expected_url <- paste0(test_url, custom_query)
  expect_identical(result$x$sources[[1]]$sourceOptions$data, expected_url)
})

# Image source
test_that("add_image adds image source", {
  m <- map()
  # Use a realistic but mock image URL
  test_url <- "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
  result <- add_image(m, image_id = "test_image", image_url = test_url)

  expect_identical(length(result$x$imageSources), 1L)
  expect_identical(result$x$imageSources[[1]]$imageId, "test_image")
  expect_identical(result$x$imageSources[[1]]$imageUrl, test_url)
})


# Map server tiles
test_that("add_tiles_from_map_server adds tile source", {
  m <- map()
  test_url <- "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
  result <- add_tiles_from_map_server(m, url = test_url, tile_id = "map_tiles")

  expect_identical(length(result$x$mapServerTiles), 1L)
  expect_identical(result$x$mapServerTiles[[1]]$tileId, "map_tiles")
  expect_identical(result$x$mapServerTiles[[1]]$mapServiceUrl, test_url)
})

test_that("add_tiles_from_map_server as_image_layer option works", {
  m <- map()
  test_url <- "https://server.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer"
  result <- add_tiles_from_map_server(
    m,
    url = test_url,
    tile_id = "image_tiles",
    as_image_layer = TRUE
  )

  expect_identical(length(result$x$imageLayerTiles), 1L)
  expect_identical(result$x$imageLayerTiles[[1]]$tileId, "image_tiles")
})

# WMS tiles
test_that("add_tiles_from_wms adds wms tile source", {
  m <- map()
  test_url <- "https://server.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer"
  result <- add_tiles_from_wms(m, url = test_url, tile_id = "wms_tiles")

  expect_identical(length(result$x$mapServerTiles), 1L)
  expect_identical(result$x$mapServerTiles[[1]]$tileId, "wms_tiles")
  expect_identical(result$x$mapServerTiles[[1]]$mapServiceUrl, test_url)
})

# Source data updates
test_that("set_source_data updates existing source data", {
  skip_if_not_installed("sf")

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

  result <- set_source_data(proxy, source_id = "test_source", data = mock_sf)

  expect_s3_class(result, "mapProxy")
})

test_that("set_source_data with URL data", {
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

  # For URL data, we should use type = "vector" or mock geojson data
  # since the function expects sf objects for geojson type
  test_url <- "https://example.com/data.geojson"
  result <- set_source_data(
    proxy,
    source_id = "url_source",
    data = test_url,
    type = "vector"
  )

  expect_s3_class(result, "mapProxy")
})
