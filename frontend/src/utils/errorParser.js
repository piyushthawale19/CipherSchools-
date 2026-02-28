// ============================================================
// utils/errorParser.js
// Extracts a user-readable message from Axios error responses.
// ============================================================

/**
 * @param {import("axios").AxiosError | Error} error
 * @returns {string}
 */
export const parseError = (error) => {
  // Axios error with API response
  if (error?.response?.data) {
    const { message, error: errMsg } = error.response.data;
    return message || errMsg || "An unexpected error occurred.";
  }
  // Network error (no response)
  if (error?.request) {
    return "Cannot reach the server. Check your connection.";
  }
  return error?.message || "An unexpected error occurred.";
};
