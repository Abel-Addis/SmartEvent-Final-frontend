import { ref } from "vue";

export function useErrorNotification() {
  const showError = ref(false);
  const errorTitle = ref("Error");
  const errorMessage = ref("");
  const errorDetail = ref(null);
  const errorStatusCode = ref(null);
  const errorType = ref("error");

  /**
   * Display a notification
   * @param {Object|string} error - Error object or message string
   * @param {string} customTitle - Optional custom title
   * @param {string} type - Notification type: 'error', 'success', 'warning', 'info'
   */
  const displayError = (error, customTitle = null, type = "error") => {
    // Reset previous error
    showError.value = false;
    errorType.value = type;

    // Parse error based on type
    if (typeof error === "string") {
      errorMessage.value = error;
      errorDetail.value = null;
      errorStatusCode.value = null;
    } else if (error?.response?.data) {
      // Axios error response
      const data = error.response.data;
      errorMessage.value = data.error || data.message || "An error occurred";
      errorDetail.value = data.detail || null;
      errorStatusCode.value = data.statusCode || error.response.status || null;
    } else if (error?.error) {
      // Direct backend error object
      errorMessage.value = error.error;
      errorDetail.value = error.detail || null;
      errorStatusCode.value = error.statusCode || null;
    } else if (error?.message) {
      // Standard Error object
      errorMessage.value = error.message;
      errorDetail.value = null;
      errorStatusCode.value = null;
    } else {
      errorMessage.value = "An error occurred";
      errorDetail.value = null;
      errorStatusCode.value = null;
    }

    // Set title based on type and customTitle
    if (customTitle) {
      errorTitle.value = customTitle;
    } else if (type === "success") {
      errorTitle.value = "Success";
    } else if (type === "warning") {
      errorTitle.value = "Warning";
    } else if (type === "info") {
      errorTitle.value = "Information";
    } else if (errorStatusCode.value) {
      if (errorStatusCode.value >= 500) {
        errorTitle.value = "Server Error";
      } else if (errorStatusCode.value >= 400) {
        errorTitle.value = "Request Error";
      } else {
        errorTitle.value = "Error";
      }
    } else {
      errorTitle.value = "Error";
    }

    // Show the notification
    showError.value = true;
  };

  const closeError = () => {
    showError.value = false;
  };

  return {
    showError,
    errorTitle,
    errorMessage,
    errorDetail,
    errorStatusCode,
    errorType,
    displayError,
    closeError,
  };
}
