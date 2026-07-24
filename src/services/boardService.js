import { getHeaders, handleApiResponse } from "../utils/apiUtils";

const BASE_URL = "/api/v1/boards";

export async function createBoard({ name, description }) {
  const response = await fetch(`${BASE_URL}/create-board`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({ name, description })
  });

  return handleApiResponse(response, "Failed to create board");
}

export async function getBoards() {
  const response = await fetch(`${BASE_URL}/get-boards`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include"
  });

  return handleApiResponse(response, "Failed to fetch boards");
}

export async function getBoardById(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include"
  });

  return handleApiResponse(response, "Failed to fetch board details");
}

export async function updateBoard({ id, name, description }) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({ name, description })
  });

  return handleApiResponse(response, "Failed to update board");
}

export async function deleteBoard(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include"
  });

  return handleApiResponse(response, "Failed to delete board");
}

export async function addBoardMember({ boardId, userId }) {
  const response = await fetch(`${BASE_URL}/${boardId}/members`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({ userId })
  });

  return handleApiResponse(response, "Failed to add member to board");
}

export async function removeBoardMember({ boardId, userId }) {
  const response = await fetch(`${BASE_URL}/${boardId}/members/${userId}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include"
  });

  return handleApiResponse(response, "Failed to remove member from board");
}