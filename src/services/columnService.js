import { getHeaders, handleApiResponse } from "../utils/apiUtils";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const BASE_URL = `${API_BASE}/api/v1/columns`;

export async function getColumnsByBoard(boardId) {
  const response = await fetch(`${BASE_URL}/board/${boardId}`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });

  return handleApiResponse(response, "Failed to fetch board columns");
}

export async function createColumn({ title, boardId, position }) {
  const response = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({ title, boardId, position }),
  });

  return handleApiResponse(response, "Failed to create column");
}

export async function createDefaultColumns(boardId, titles) {
  const response = await fetch(`${BASE_URL}/bulk-create`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({ boardId, titles }),
  });

  return handleApiResponse(response, "Failed to initialize default columns");
}

export async function updateColumn(columnId, { title, position }) {
  const response = await fetch(`${BASE_URL}/${columnId}`, {
    method: "PATCH",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({ title, position }),
  });

  return handleApiResponse(response, "Failed to update column");
}

export async function deleteColumn(columnId) {
  const response = await fetch(`${BASE_URL}/${columnId}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include",
  });

  return handleApiResponse(response, "Failed to delete column");
}
