const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const BASE_URL = `${API_BASE}/api/v1/users`;

export async function registerUser({ fullName, email, dob, password, profilePicFile }) {
  const formData = new FormData();
  formData.append("fullName", fullName);
  formData.append("email", email);
  formData.append("dob", dob);
  formData.append("password", password);

  // Must match the multer field name on the backend: "profilePicTag"
  if (profilePicFile) {
    formData.append("profilePicTag", profilePicFile);
  }

  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    credentials: "include",
    body: formData,
    // Do NOT set Content-Type header manually — the browser sets it
    // automatically with the correct multipart boundary when using FormData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
}

export async function loginUser({ email, password }) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

export async function updateUserProfile({ fullName, dob }) {
  const response = await fetch(`${BASE_URL}/update-account`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ fullName, dob }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update profile details");
  }

  return data;
}


export async function changePassword({ oldPassword, newPassword }) {
  const response = await fetch(`${BASE_URL}/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to change password");
  }

  return data;
}


export async function logout() {
  const response = await fetch(`${BASE_URL}/logout`, {
    method: "POST",
    credentials: "include", // Send cookies
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Logout failed");
  }

  return data;
}

export async function getCurrentUser() {
  const response = await fetch(`${BASE_URL}/current-user`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch current user");
  }

  return data;
}