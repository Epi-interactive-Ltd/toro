#' Helper function to convert local image to data URI
#'
#' @param image_path The file path to the local image.
#' @return A data URI string representing the image.
#' @keywords internal
image_to_data_uri <- function(image_path) {
  if (!file.exists(image_path)) {
    stop("Image file not found: ", image_path)
  }

  # Get file extension
  ext <- tolower(tools::file_ext(image_path))

  # Determine MIME type
  mime_type <- switch(
    ext,
    "png" = "image/png",
    "jpg" = "image/jpeg",
    "jpeg" = "image/jpeg",
    "gif" = "image/gif",
    "svg" = "image/svg+xml",
    "image/png" # default
  )

  # Read file as binary and encode as base64
  image_data <- base64enc::base64encode(image_path)

  # Create data URI
  paste0("data:", mime_type, ";base64,", image_data)
}

#' Helper function to detect if URL is a local file path
#'
#' @param url The URL or file path to check.
#' @return TRUE if it's a local file path, `FALSE` if it's a URL or data URI.
#' @keywords internal
is_local_file <- function(url) {
  # Check if it's a URL (starts with http/https)
  if (grepl("^https?://", url)) {
    return(FALSE)
  }

  # Check if it's already a data URI
  if (grepl("^data:", url)) {
    return(FALSE)
  }

  # If it exists as a file, treat as local
  return(file.exists(url))
}
