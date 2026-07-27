import { getHeaders, handleApiResponse } from "../utils/apiUtils";

const BASE_URL = "/api/v1/tasks";

export async function getTasksByBoard(boardId) {
  const response = await fetch(`${BASE_URL}/board/${boardId}`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });

  return handleApiResponse(response, "Failed to fetch board tasks");
}

export async function createTask(taskData) {
  const response = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(taskData),
  });

  return handleApiResponse(response, "Failed to create task");
}

export async function updateTask(taskId, updates) {
  const response = await fetch(`${BASE_URL}/${taskId}`, {
    method: "PATCH",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(updates),
  });

  return handleApiResponse(response, "Failed to update task");
}

export async function deleteTask(taskId) {
  const response = await fetch(`${BASE_URL}/${taskId}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include",
  });

  return handleApiResponse(response, "Failed to delete task");
}
