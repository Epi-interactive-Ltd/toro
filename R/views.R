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

#' Compute a bounding box for an `sf` object that correctly handles antimeridian crossings
#'
#' A naive `sf::st_bbox()` calculation on data that straddles the antimeridian (180th meridian) -
#' for example, data centered around Fiji - produces a bounding box spanning almost the entire
#' globe. This happens because some coordinates are stored as longitudes just under 180 (e.g. 179)
#' and others just under -180 (e.g. -179), even though they are geographically close together. The
#' naive `xmin`/`xmax` then span nearly -180 to 180, centering the box near longitude 0 (over
#' Africa) instead of over the actual data.
#'
#' This function detects that case by comparing the naive longitude span against the span you get
#' if you "unroll" negative longitudes into the 0-360 range (so e.g. 179 and -179 become 179 and
#' 181, a span of 2 rather than 358), and uses whichever span is narrower.
#'
#' @param bounds An `sf` object.
#' @return A list with `xmin`, `ymin`, `xmax`, and `ymax` elements. Note that `xmax` (and, in
#'    principle, `xmin`) may fall outside the usual -180 to 180 range when the bounding box crosses
#'    the antimeridian - this is intentional, and is supported directly by MapLibre GL JS's
#'    `fitBounds()`.
#' @keywords internal
#' @noRd
.antimeridian_safe_bbox <- function(bounds) {
  coords <- sf::st_coordinates(bounds)
  lons <- coords[, "X"]
  lats <- coords[, "Y"]

  # The "naive" bounding box, equivalent to what sf::st_bbox() would give you.
  naive_xmin <- min(lons)
  naive_xmax <- max(lons)
  naive_span <- naive_xmax - naive_xmin

  # The bounding box if negative longitudes are shifted into the 0-360 range, giving a contiguous
  # range for data that crosses the antimeridian.
  shifted_lons <- ifelse(lons < 0, lons + 360, lons)
  shifted_xmin <- min(shifted_lons)
  shifted_xmax <- max(shifted_lons)
  shifted_span <- shifted_xmax - shifted_xmin

  if (shifted_span < naive_span) {
    xmin <- shifted_xmin
    xmax <- shifted_xmax
  } else {
    xmin <- naive_xmin
    xmax <- naive_xmax
  }

  list(
    xmin = xmin,
    ymin = min(lats),
    xmax = xmax,
    ymax = max(lats)
  )
}

#' Get the bounds in the correct format
#'
#' This function takes either a list of two coordinate pairs or an sf object and returns the bounds
#' in the correct format for the JS function.
#'
#' @param bounds A list of two coordinate pairs or an sf object.
#' @return A list of two coordinate pairs in the format `list(list(lon1, lat1), list(lon2, lat2))`.
#' @keywords internal
validate_bounds <- function(bounds) {
  if (inherits(bounds, "sf")) {
    bbox <- .antimeridian_safe_bbox(bounds)
    bounds <- list(
      list(bbox$xmin, bbox$ymin),
      list(bbox$xmax, bbox$ymax)
    )
  }
  bounds
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
  bounds <- validate_bounds(bounds)
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
