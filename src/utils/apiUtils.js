/**
 * Helper function to retrieve standard JSON headers
 */
export function getHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

/**
 * Handles fetch response parsing and formats user-friendly error messages based on HTTP status codes.
 */
export async function handleApiResponse(response, defaultErrorMsg = "An error occurred") {
  let data = {};
  try {
    data = await response.json();
  } catch (err) {
    // Response had no JSON body
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw new Error("Your session has expired or you do not have permission. Please log in again.");
    }
    if (response.status === 404) {
      throw new Error(data.message || "The requested item or resource could not be found.");
    }
    throw new Error(data.message || defaultErrorMsg);
  }

  return data;
}
