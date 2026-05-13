#' Set the map zoom level
#'
#' @param map The map or map proxy object.
#' @param zoom The zoom level to set. Default is 2.
#' @return The map or map proxy object for chaining.
#' @export
#'
#' @examples
#'  map() |>
#'   set_zoom(5)
set_zoom <- function(map, zoom) {
  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage("setMapZoom", list(id = map$id, zoom = zoom))
  }
  if (is.null(map$x$setZoom)) {
    map$x$setZoom <- zoom
  }
  map
}

#' Set the map bounds
#'
#' @param map The map or map proxy object.
#' @param bounds One of two formats:
#' - A list of two coordinate pairs: `list(list(lon1, lat1), list(lon2, lat2))`
#' - An `sf` object, which will be converted to a bounding box
#' @param padding The padding around the bounds in pixels. Default is 50.
#' @param options A list of extra options to pass directly to the
#'   [MapLibre GL JS `fitBounds` function](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/FitBoundsOptions/).
#'   \itemize{
#'     \item maxZoom: The maximum zoom level to set. Default is the object's `maxZoom`.
#'     \item linear: The type of map transition, see the above `fitBounds` function documentation
#'       for more information.
#'   }
#' @return The map or map proxy object for chaining.
#' @export
#'
#' @examples
#' # Load libraries
#' library(toro)
#' library(spData)
#' library(sf)
#'
#' nz_data <- spData::nz_height |>
#'   sf::st_transform(4326)
#'
#' map() |>
#'   set_bounds(list(list(-79, 43), list(-73, 45)))
#'
#' map() |>
#'  set_bounds(bounds = nz_data)
set_bounds <- function(
  map,
  bounds,
  padding = 50,
  options = list(
    maxZoom = map$maxZoom,
    linear = FALSE
  )
) {
  if (inherits(bounds, "sf")) {
    # Convert sf object to bounding box
    bbox <- sf::st_bbox(bounds)
    bounds <- list(
      list(as.numeric(bbox["xmin"]), as.numeric(bbox["ymin"])),
      list(as.numeric(bbox["xmax"]), as.numeric(bbox["ymax"]))
    )
  }
  options <- list(
    bounds = bounds,
    padding = padding,
    options = options
  )
  # For JS need to be: [[-79, 43], [-73, 45]]
  # We use lists to achieve this: list(list(-79, 43), list(-73, 45))

  if (inherits(map, "mapProxy")) {
    map$session$sendCustomMessage(
      "setMapBounds",
      list(id = map$id, options = options)
    )
  }
  map$x$setBounds <- options
  map
}
