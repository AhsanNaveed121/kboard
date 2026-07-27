import { getHeaders, handleApiResponse } from "../utils/apiUtils";

const BASE_URL = "/api/v1/users";

export async function getAllUsers() {
  const response = await fetch(`${BASE_URL}`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include"
  });

  const data = await handleApiResponse(response, "Failed to fetch user list");
  return data.data || data;
}

export async function searchUsers(query) {
  const response = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include"
  });

  const data = await handleApiResponse(response, "Failed to search users");
  return data.data || data;
}

export async function updateUserRole(userId, role) {
  const response = await fetch(`${BASE_URL}/${userId}/role`, {
    method: "PATCH",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({ role })
  });

  const data = await handleApiResponse(response, "Failed to update user role");
  return data.data || data;
}

export async function deleteUser(userId) {
  const response = await fetch(`${BASE_URL}/${userId}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include"
  });

  const data = await handleApiResponse(response, "Failed to delete user");
  return data.data || data;
}
