/**
 * Helper function to retrieve headers including JWT token from localStorage
 */
export function getHeaders() {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` })
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
    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      throw new Error("Your session has expired or the token is invalid. Please log in again.");
    }
    if (response.status === 403) {
      throw new Error(data.message || "Access denied. You do not have permission to perform this operation.");
    }
    if (response.status === 404) {
      throw new Error(data.message || "The requested item or resource could not be found.");
    }
    throw new Error(data.message || defaultErrorMsg);
  }

  return data;
}
