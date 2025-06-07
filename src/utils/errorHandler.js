/**
 * Helper function to extract error message from API response
 * Handles different types of error responses including validation errors
 * @param {Error} err - The error object from API call
 * @param {string} defaultMessage - Default message if no specific error found
 * @returns {string} - Formatted error message
 */
export const getErrorMessage = (err, defaultMessage = 'An error occurred') => {
  if (err.response?.data?.detail) {
    const detail = err.response.data.detail;
    
    // If detail is an array of validation errors (FastAPI validation errors)
    if (Array.isArray(detail)) {
      return detail.map(error => {
        if (typeof error === 'object' && error.msg) {
          // Format field-specific errors
          const field = error.loc && error.loc.length > 1 ? error.loc[error.loc.length - 1] : '';
          return field ? `${field}: ${error.msg}` : error.msg;
        }
        return String(error);
      }).join(', ');
    } 
    // If detail is a string
    else if (typeof detail === 'string') {
      return detail;
    }
    // If detail is an object with msg property
    else if (typeof detail === 'object' && detail.msg) {
      return detail.msg;
    }
    // If detail is an object with error_type (custom error format)
    else if (typeof detail === 'object' && detail.error_type) {
      return detail.message || detail.error_type;
    }
    // Fallback for other object types
    else if (typeof detail === 'object') {
      return JSON.stringify(detail);
    }
  } 
  
  // Check for other common error formats
  if (err.response?.data?.message) {
    return err.response.data.message;
  }
  
  if (err.message) {
    return err.message;
  }
  
  return defaultMessage;
};

/**
 * Helper function to check if error is a specific HTTP status
 * @param {Error} err - The error object
 * @param {number} status - HTTP status code to check
 * @returns {boolean} - True if error matches the status
 */
export const isErrorStatus = (err, status) => {
  return err.response?.status === status;
};

/**
 * Helper function to check if error is a validation error (422)
 * @param {Error} err - The error object
 * @returns {boolean} - True if error is a validation error
 */
export const isValidationError = (err) => {
  return isErrorStatus(err, 422);
};

/**
 * Helper function to check if error is unauthorized (401)
 * @param {Error} err - The error object
 * @returns {boolean} - True if error is unauthorized
 */
export const isUnauthorizedError = (err) => {
  return isErrorStatus(err, 401);
};

/**
 * Helper function to check if error is forbidden (403)
 * @param {Error} err - The error object
 * @returns {boolean} - True if error is forbidden
 */
export const isForbiddenError = (err) => {
  return isErrorStatus(err, 403);
};

/**
 * Helper function to check if error is not found (404)
 * @param {Error} err - The error object
 * @returns {boolean} - True if error is not found
 */
export const isNotFoundError = (err) => {
  return isErrorStatus(err, 404);
}; 