mock_raw_data <- data.frame(
  id = 1:3,
  lon = c(174, 175, 176),
  lat = c(-41, -42, -43),
  value = c(10, 20, 30)
)

# processed data
mock_processed_data <- transform(mock_raw_data, value2 = value * 2)

# sf mock
if (requireNamespace("sf", quietly = TRUE)) {
  mock_sf <- sf::st_as_sf(
    data.frame(
      id = 1:3,
      value = c("A", "B", "C"),
      lon = c(174, 175, 176),
      lat = c(-41, -42, -43)
    ),
    coords = c("lon", "lat"),
    crs = 4326
  )
} else {
  mock_sf <- NULL
}
