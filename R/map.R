#' MaplibreMap: R6 class for interactive Maplibre maps in Shiny
#'
#' @field session The Shiny session object.
#' @field widget The htmlwidget object for the map.
#' @field id The unique map element ID.
#' @field maxZoom The maximum zoom level.
#' @field mapTilerApiKey API key for MapTiler.
#' @field arcGisApiKey API key for ArcGIS.
#' @field mapboxApiKey API key for Mapbox.
MaplibreMap <- R6::R6Class(
  "maplibReGL",
  public = list(
    session = NULL,
    widget = NULL,
    id = NULL,
    maxZoom = NULL,
    mapTilerApiKey = NULL,
    arcGisApiKey = NULL,
    mapboxApiKey = NULL,

    #' Create a new MaplibreMap object.
    #'
    #' @param center Numeric vector of length 2, map center (lon, lat).
    #' @param zoom Initial zoom level.
    #' @param width Map width.
    #' @param height Map height.
    #' @param elementId HTML element ID.
    #' @param props List of map properties.
    #' @param session Shiny session object.
    initialize = function(
      center = c(174, -41),
      zoom = 2,
      width = "100%",
      height = "100%",
      elementId = NULL,
      props = list(),
      session = shiny::getDefaultReactiveDomain()
    ) {
      in_shiny <- !is.null(shiny::getDefaultReactiveDomain())
      self$id <- if (is.null(elementId)) {
        paste0("maplibre_", as.integer(runif(1, 1, 1e6)))
      } else {
        elementId
      }
      self$session <- session

      image_sources <- NULL
      if (!is.null(props$imageSources)) {
        image_sources <- props$imageSources
      }
      self$maxZoom <- props$maxZoom %||% 18

      self$widget <- htmlwidgets::createWidget(
        name = "map",
        x = list(
          center = props$center %||% center,
          zoom = props$zoom %||% zoom,
          minZoom = props$minZoom %||% 2,
          maxZoom = props$maxZoom %||% 18,
          clusterColour = props$clusterColour %||% "#808080",
          mapTilerApiKey = props$mapTilerApiKey %||% NULL,
          arcGisApiKey = props$arcGisApiKey %||% NULL,
          mapboxApiKey = props$mapboxApiKey %||% NULL,
          # Full options: c("natgeo", "satellite", "topo", "terrain", "streets", "shaded", "light-grey")
          loadedTiles = props$loadedTiles %||% c("light-grey"),
          initialTileLayer = props$initialTileLayer %||% NULL,
          imageSources = image_sources,
          backgroundColour = props$backgroundColour %||% "#D0CFD4",
          enable3D = props$enable3D %||% FALSE,
          initialLoadedLayers = props$initialLoadedLayers %||% NULL,
          spinnerWhileBusy = props$spinnerWhileBusy %||% FALSE,
          busyLoaderBgColour = props$busyLoaderBgColour %||% "rgba(0, 0, 0, 0.2)",
          busyLoaderColour = props$busyLoaderColour %||% "white",
          initialLoaderBgColour = props$initialLoaderBgColour %||% "white",
          initialLoaderColour = props$initialLoaderColour %||% "black"
        ),
        width = width,
        height = height,
        elementId = if (in_shiny) NULL else self$id
      )
    },

    #' Set API keys for various map services.
    #'
    #' @param api_key The API key to set.
    #' @return        NULL
    set_mapTiler_api_key = function(api_key) {
      self$mapTilerApiKey <- api_key
    },

    #' Set API key for ArcGIS services.
    #'
    #' @param api_key The API key to set.
    #' @return        NULL
    set_arcGis_api_key = function(api_key) {
      self$arcGisApiKey <- api_key
    },

    #' Set API key for Mapbox services.
    #'
    #' @param api_key The API key to set.
    #' @return        NULL
    set_mapbox_api_key = function(api_key) {
      self$mapboxApiKey <- api_key
    },

    #' Set the tile layer for the map.
    #'
    #' @param tiles A character vector of tile layer names.
    #'              Options include "natgeo", "satellite", "topo", "terrain",
    #'              "streets", "shaded", "light-grey".
    #' @return      NULL
    set_tile_layer = function(tiles) {
      self$session$sendCustomMessage("setSelectedTiles", list(id = self$id, tiles = tiles))
    },

    #' Set the map zoom level.
    #'
    #' @param zoom  The zoom level to set. Default is 2.
    #' @return      NULL
    set_zoom = function(zoom) {
      self$session$sendCustomMessage("setMapZoom", list(id = self$id, zoom = zoom))
    },

    #' Set the map bounds.
    #'
    #' @param bounds  A list of two lists, each containing longitude and latitude pairs.
    #'                For example: `list(list(-79, 43), list(-73, 45))`.
    #' @param padding The padding around the bounds in pixels. Default is 50.
    #' @param maxZoom The maximum zoom level to set. Default is the object's `maxZoom`.
    #' @return        NULL
    set_bounds = function(bounds, padding = 50, maxZoom = self$maxZoom) {
      # For JS need to be: [[-79, 43], [-73, 45]]
      # We use lists to achieve this: list(list(-79, 43), list(-73, 45))
      self$session$sendCustomMessage(
        "setMapBounds",
        list(id = self$id, bounds = bounds, padding = padding, maxZoom = maxZoom)
      )
    },

    #' Get the UI for the map widget.
    #'
    #' @return The HTML widget for the map.
    ui = function() {
      self$widget
    },

    #' Add a source to the map.
    #'
    #' @param source_id The ID for the source.
    #' @param data      The data for the source, typically in GeoJSON format.
    #' @param type      The type of the source. Default is `"geojson"`.
    #'                  Other options include `"vector"` or `"raster"`.
    #' @param cluster   Whether to enable clustering for this source. Default is `FALSE`.
    #' @return          NULL
    add_source = function(
      source_id,
      data,
      type = "geojson",
      cluster = FALSE
    ) {
      if (type == "geojson" && !"geojson" %in% class(data)) {
        data <- geojsonsf::sf_geojson(data)
      }
      self$session$sendCustomMessage(
        "addMapSource",
        list(
          id = self$id,
          sourceId = source_id,
          type = type,
          data = data,
          cluster = cluster
        )
      )
    },

    #' Add a FeatureServer source to the map.
    #'
    #' @param source_url  The URL of the FeatureServer source.
    #' @param source_id   The ID for the source.
    #' @return            NULL
    add_feature_server_source = function(source_url, source_id) {
      self$session$sendCustomMessage(
        "addFeatureServerSource",
        list(
          id = self$id,
          sourceUrl = source_url,
          sourceId = source_id
        )
      )
    },

    #' Add an image source to the map.
    #'
    #' @param image_name  The name of the image source.
    #' @param image_url   The URL of the image to add.
    #' @return            NULL
    add_image = function(image_name, image_url) {
      self$session$sendCustomMessage(
        "addImageSource",
        list(
          id = self$id,
          imageId = image_name,
          imageUrl = image_url
        )
      )
    },

    #' Set data for a source on the map.
    #'
    #' @param source_id The ID of the source to update.
    #' @param data      The data for the source, typically in GeoJSON format.
    #' @param type      The type of the source. Default is `"geojson"`.
    #'                  Other options include `"vector"` or `"raster"`.
    #' @return          NULL
    set_source_data = function(source_id, data, type = "geojson") {
      if (type == "geojson" && !"geojson" %in% class(data)) {
        data <- geojsonsf::sf_geojson(data)
      }
      self$session$sendCustomMessage(
        "updateSourceData",
        list(
          id = self$id,
          sourceId = source_id,
          data = data
        )
      )
    },

    #' Add a grid of latitude and longitude lines to the map.
    #'
    #' @param grid_colour The colour of the grid lines. Default is `"#000000"`.
    #' @return            NULL
    add_lat_lng_grid = function(grid_colour = "#000000") {
      self$session$sendCustomMessage(
        "addLatLngGrid",
        list(id = self$id, gridColour = grid_colour)
      )
    },

    #' Hide the latitude and longitude grid on the map.
    #'
    #' @return NULL
    hide_lat_lng_grid = function() {
      self$session$sendCustomMessage(
        "hideLatLngGrid",
        list(id = self$id)
      )
    },

    #' Show the latitude and longitude grid on the map.
    #'
    #' @return NULL
    show_lat_lng_grid = function() {
      self$session$sendCustomMessage(
        "showLatLngGrid",
        list(id = self$id)
      )
    },

    #' Add a cursor coordinates control to the map.
    #'
    #' @param position  The position of the cursor coordinates control on the map.
    #'                  Default is `"bottom-left"`.
    #'                  Options include "top-left", "top-right", "bottom-left", "bottom-right".
    #' @param long_label The label for the longitude coordinate. Default is `"Lng"`.
    #' @param lat_label  The label for the latitude coordinate. Default is `"Lat"`.
    #' @return          NULL
    add_cursor_coords_control = function(
      position = "bottom-left",
      long_label = "Lng",
      lat_label = "Lat"
    ) {
      self$session$sendCustomMessage(
        "addCursorCoordsControl",
        list(id = self$id, position = position, longLabel = long_label, latLabel = lat_label)
      )
    },

    #' Add a draw control to the map
    #'
    #' @param position        The position of the draw control on the map. Default is `"top-right"`.
    #'                        Options are "top-left", "top-right", "bottom-left", "bottom-right".
    #' @param modes           A vector of modes to enable in the draw control.
    #'                        Default is `c("polygon", "trash")`.
    #'                        Options include "polygon", "trash", "line".
    #' @param active_colour   The colour for the drawn shapes. Default is `"#0FB3CE"`.
    #' @param inactive_colour The colour for the inactive shapes. Default is `"#0FB3CE"`.
    #' @param mode_labels     A named list of labels for each mode.
    #'                        For example, `list(polygon = "Draw Polygon", trash = "Delete Shape")`.
    #' @return          NULL
    add_draw_control = function(
      position = "top-right",
      modes = c("polygon", "trash"),
      active_colour = "#0FB3CE",
      inactive_colour = "#0FB3CE",
      mode_labels = list()
    ) {
      self$session$sendCustomMessage(
        "addDraw",
        list(
          id = self$id,
          position = position,
          modes = list(modes),
          activeColour = active_colour,
          inactiveColour = inactive_colour,
          modeLabels = mode_labels
        )
      )
    },

    #' Add a custom HTML control to the map.
    #'
    #' @param html      The HTML content to add as a control.
    #' @param position  The position of the control on the map. Default is `"top-right"`.
    #'                  Options include "top-left", "top-right", "bottom-left", "bottom-right".
    #' @return          NULL
    add_custom_control = function(html, position = "top-right") {
      self$session$sendCustomMessage(
        "addCustomControl",
        list(
          id = self$id,
          html = html,
          position = position
        )
      )
    },

    #' Delete a drawn shape from the map.
    #'
    #' The ID of the shape is provided by the draw control when a shape is created.
    #'
    #' @param shape_id The ID of the shape to delete.
    #' @return         NULL
    delete_drawn_shape = function(shape_id) {
      self$session$sendCustomMessage(
        "deleteDrawnShape",
        list(
          id = self$id,
          shapeId = shape_id
        )
      )
    },

    #' Hide the draw controls on the map.
    #'
    #' @return NULL
    hide_draw_controls = function() {
      self$session$sendCustomMessage(
        "hideDrawControls",
        list(id = self$id)
      )
    },

    #' Show the draw controls on the map.
    #'
    #' @return NULL
    show_draw_controls = function() {
      self$session$sendCustomMessage(
        "showDrawControls",
        list(id = self$id)
      )
    },

    #' Add a layer to the map.
    #'
    #' @param layer_options     A list of options for the layer, including `id`, `type`, `source`, and any paint or layout properties.
    #' @param can_cluster       Whether the layer can be clustered. Default is `FALSE`.
    #' @param popup_column      The column name to use for popups. Default is `NULL`.
    #' @param hover_column      The column name to use for hover effects. Default is `NULL`.
    #' @param on_feature_click  Whether to enable click events on features. Default is `FALSE`.
    #' @return                  NULL
    add_layer = function(
      layer_options,
      can_cluster = FALSE,
      popup_column = NULL,
      hover_column = NULL,
      on_feature_click = FALSE
    ) {
      source <- layer_options$source
      if (any(c("sf", "data.frame", "tbl") %in% class(source))) {
        if (length(colnames(source)) == 1) {
          #' There is only a geometry column.
          #' To conver to geojson, we need to add a dummy column.
          source$id <- seq_len(nrow(source))
        }
        layer_options$source <- geojsonsf::sf_geojson(source)
      }
      self$session$sendCustomMessage(
        "addLayer",
        list(
          id = self$id,
          layerOptions = layer_options,
          canCluster = can_cluster,
          popupColumn = popup_column,
          hoverColumn = hover_column,
          onFeatureClick = on_feature_click
        )
      )
    },

    #' Hide a layer from the map.
    #'
    #' @param layer_id  The ID of the layer to hide.
    #' @return          NULL
    #'
    #' @note This does not remove the layer, it only hides it from view.
    hide_layer = function(layer_id) {
      self$session$sendCustomMessage(
        "hideLayer",
        list(
          id = self$id,
          layerId = layer_id
        )
      )
    },

    #' Show a previously hidden layer on the map.
    #'
    #' @param layer_id  The ID of the layer to show.
    #' @return          NULL
    show_layer = function(layer_id) {
      self$session$sendCustomMessage(
        "showLayer",
        list(
          id = self$id,
          layerId = layer_id
        )
      )
    },

    #' Set a paint property for a layer on the map.
    #'
    #' @param layer_id      The ID of the layer to update.
    #' @param property_name The name of the paint property to set.
    #' @param value         The value to set for the paint property.
    #' @return              NULL
    set_paint_property = function(layer_id, property_name, value) {
      self$session$sendCustomMessage(
        "setPaintProp",
        list(
          id = self$id,
          layerId = layer_id,
          property = property_name,
          value = value
        )
      )
    },

    #' Set a layout property for a layer on the map.
    #'
    #' @param layer_id      The ID of the layer to update.
    #' @param property_name The name of the layout property to set.
    #' @param value         The value to set for the layout property.
    #' @return              NULL
    set_layout_property = function(layer_id, property_name, value) {
      self$session$sendCustomMessage(
        "setLayoutProp",
        list(
          id = self$id,
          layerId = layer_id,
          property = property_name,
          value = value
        )
      )
    },

    #' Toggle clustering for a layer on the map.
    #'
    #' @param layer_id  The ID of the layer to toggle clustering for.
    #' @param cluster   Whether to enable clustering. Default is `FALSE`.
    #' @return          NULL
    toggle_clustering = function(layer_id, cluster = FALSE) {
      self$session$sendCustomMessage(
        "toggleClustering",
        list(
          id = self$id,
          layerId = layer_id,
          cluster = cluster
        )
      )
    }
  )
)

#' Create a map widget.
#'
#' Using maplibre...
#'
#' @import htmlwidgets
#'
#' @export
map <- function(props = list(), width = NULL, height = NULL, elementId = NULL) {
  MaplibreMap$new(width = width, height = height, elementId = elementId, props = props)
}

#' Shiny bindings for map
#'
#' Output and render functions for using map within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a map
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name map-shiny
#'
#' @export
mapOutput <- function(outputId, width = "100%", height = "600px") {
  htmlwidgets::shinyWidgetOutput(outputId, "map", width, height, package = "maplibReGL")
}

#' @rdname map-shiny
#' @export
renderMap <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) {
    expr <- substitute(expr)
  } # force quoted
  htmlwidgets::shinyRenderWidget(expr, mapOutput, env, quoted = TRUE)
}
