import toast from "react-hot-toast";

/**
 * Standardized error handling utility
 */
export const handleApiError = (error, context = '') => {
  console.error(`${context} Error:`, error);
  
  // Network errors
  if (!error.response) {
    toast.error("Network error. Please check your connection and try again.");
    return "Network error";
  }
  
  const { status, data } = error.response;
  let message = "Something went wrong. Please try again.";
  
  switch (status) {
    case 400:
      message = data?.message || "Invalid request. Please check your input.";
      break;
    case 401:
      message = "Session expired. Please log in again.";
      // Note: Redirect to login will be handled by axios interceptor
      break;
    case 403:
      message = "You don't have permission to perform this action.";
      break;
    case 404:
      message = data?.message || "The requested resource was not found.";
      break;
    case 409:
      message = data?.message || "A conflict occurred. Please try again.";
      break;
    case 422:
      message = data?.message || "Please check your input and try again.";
      break;
    case 429:
      message = "Too many requests. Please wait a moment and try again.";
      break;
    case 500:
      message = "Server error. Please try again later.";
      break;
    case 503:
      message = "Service temporarily unavailable. Please try again later.";
      break;
    default:
      message = data?.message || `Request failed with status ${status}`;
  }
  
  toast.error(message);
  return message;
};

/**
 * Handle success messages consistently
 */
export const handleApiSuccess = (message, data = null) => {
  toast.success(message);
  return { message, data };
};

/**
 * Validation error handler for forms
 */
export const handleValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    errors.forEach(error => toast.error(error));
  } else if (typeof errors === 'object') {
    Object.values(errors).forEach(error => toast.error(error));
  } else {
    toast.error(errors || "Validation failed");
  }
};

/**
 * Generic async operation wrapper with error handling
 */
export const withErrorHandling = async (operation, context = '', successMessage = null) => {
  try {
    const result = await operation();
    if (successMessage) {
      handleApiSuccess(successMessage);
    }
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = handleApiError(error, context);
    return { success: false, error: errorMessage };
  }
};
