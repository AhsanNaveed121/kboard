import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getAllUsers, updateUserRole, deleteUser } from "../services/userService";
import { getBoards, deleteBoard } from "../services/boardService";

export default function AdminDashboard() {
  const { user, updateUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("users");
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });

  const {
    data: users = [],
    isLoading: usersLoading,
    isError: usersIsError,
    error: usersError,
  } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: getAllUsers,
    enabled: !!user && user.role === "admin",
  });

  const {
    data: boardsResponse,
    isLoading: boardsLoading,
    isError: boardsIsError,
    error: boardsError,
  } = useQuery({
    queryKey: ["adminBoards"],
    queryFn: getBoards,
    enabled: !!user && user.role === "admin",
  });

  const boards = Array.isArray(boardsResponse?.data)
    ? boardsResponse.data
    : Array.isArray(boardsResponse)
    ? boardsResponse
    : [];
  //admin operations
  const roleMutation = useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      if (variables.userId === user._id) {
        updateUser({ role: variables.role });
        if (variables.role !== "admin") {
          navigate("/boards");
          return;
        }
      }
      setStatusMessage({ text: `User role updated to ${variables.role}.`, type: "success" });
      setTimeout(() => setStatusMessage({ text: "", type: "" }), 4000);
    },
    onError: (err) => {
      setStatusMessage({ text: err.message || "Failed to update user role", type: "error" });
    },
  });
  const deleteUserMutation = useMutation({
    mutationFn: (userId) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setStatusMessage({ text: "User account deleted successfully.", type: "success" });
      setTimeout(() => setStatusMessage({ text: "", type: "" }), 4000);
    },
    onError: (err) => {
      setStatusMessage({ text: err.message || "Failed to delete user account", type: "error" });
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: (boardId) => deleteBoard(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBoards"] });
      setStatusMessage({ text: "Board deleted successfully.", type: "success" });
      setTimeout(() => setStatusMessage({ text: "", type: "" }), 4000);
    },
    onError: (err) => {
      setStatusMessage({ text: err.message || "Failed to delete board", type: "error" });
    },
  });

  const handleRoleToggle = (targetUser) => {
    const newRole = targetUser.role === "admin" ? "user" : "admin";
    if (targetUser._id === user._id) {
      if (!window.confirm("Warning: Demoting your own active account will revoke administrative privileges. Proceed?")) {
        return;
      }
    } else {
      if (!window.confirm(`Change access role of ${targetUser.fullName || targetUser.email} to '${newRole.toUpperCase()}'?`)) {
        return;
      }
    }
    roleMutation.mutate({ userId: targetUser._id, role: newRole });
  };

  const handleDeleteUser = (targetUser) => {
    if (targetUser._id === user._id) {
      alert("Self-deletion is restricted to prevent administrative lockout.");
      return;
    }
    if (window.confirm(`Permanently delete account for "${targetUser.fullName || targetUser.email}"? This action cannot be undone.`)) {
      deleteUserMutation.mutate(targetUser._id);
    }
  };

  const handleDeleteBoard = (board) => {
    if (window.confirm(`Administrative Action: Delete board "${board.name}" and all associated data permanently?`)) {
      deleteBoardMutation.mutate(board._id);
    }
  };

  if (authLoading) {
    return (
      <main className="admin-page">
        <div className="admin-container">
          <div className="loading-state">Loading Control Panel...</div>
        </div>
      </main>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <main className="admin-page">
        <div className="admin-container">
          <div className="boards-auth-error">
            <h1>Access Restricted</h1>
            <p>Administrative authorization is required to view this panel.</p>
            <button className="btn-primary" onClick={() => navigate("/boards")}>
              Back to Workspace
            </button>
          </div>
        </div>
      </main>
    );
  }

  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <main className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <header className="admin-header">
          <div>
            <span className="admin-badge">ADMINISTRATION WORKSPACE</span>
            <h1>Control Panel</h1>
            <p className="admin-subtitle">
              System overview, user role authorization, and workspace management.
            </p>
          </div>
        </header>

        {/* System Stats Overview */}
        <section className="admin-stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Registered Users</span>
              <span className="stat-value">{usersLoading ? "..." : users.length}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">System Administrators</span>
              <span className="stat-value">{usersLoading ? "..." : adminCount}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Active Boards</span>
              <span className="stat-value">{boardsLoading ? "..." : boards.length}</span>
            </div>
          </div>
        </section>
        {statusMessage.text && (
          <div className={`status-banner ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            User Accounts ({users.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "boards" ? "active" : ""}`}
            onClick={() => setActiveTab("boards")}
          >
            System Boards ({boards.length})
          </button>
        </div>

        {/* --- Tab Content: Users --- */}
        {activeTab === "users" && (
          <section className="admin-content-section">
            {usersIsError && (
              <div className="form-error">
                {usersError?.message || "Failed to load user directory."}
              </div>
            )}

            {usersLoading ? (
              <div className="loading-state">Fetching user directory...</div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email Address</th>
                      <th>Date of Birth</th>
                      <th>Role</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className={u._id === user._id ? "current-user-row" : ""}>
                        <td>
                          <div className="user-cell">
                            {u.profilePicTag ? (
                              <img src={u.profilePicTag} alt="" className="user-avatar" />
                            ) : (
                              <div className="user-avatar-placeholder">
                                {u.fullName ? u.fullName[0].toUpperCase() : "U"}
                              </div>
                            )}
                            <div>
                              <div className="user-name">
                                {u.fullName || "Unnamed User"}
                                {u._id === user._id && <span className="you-tag"> (You)</span>}
                              </div>
                              <div className="user-id">ID: {u._id}</div>
                            </div>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.dob ? new Date(u.dob).toLocaleDateString() : "N/A"}</td>
                        <td>
                          <span className={`role-badge ${u.role === "admin" ? "badge-admin" : "badge-user"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions-group">
                            <button
                              className={`btn-role-toggle ${u.role === "admin" ? "demote" : "promote"}`}
                              onClick={() => handleRoleToggle(u)}
                              disabled={roleMutation.isPending}
                            >
                              {u.role === "admin" ? "Set as User" : "Make Admin"}
                            </button>
                            {u._id !== user._id && (
                              <button
                                className="btn-danger-sm"
                                onClick={() => handleDeleteUser(u)}
                                disabled={deleteUserMutation.isPending}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* --- Tab Content: Boards --- */}
        {activeTab === "boards" && (
          <section className="admin-content-section">
            {boardsIsError && (
              <div className="form-error">
                {boardsError?.message || "Failed to load system boards."}
              </div>
            )}

            {boardsLoading ? (
              <div className="loading-state">Fetching board directory...</div>
            ) : boards.length === 0 ? (
              <div className="boards-empty-state">
                <h2>No Boards Registered</h2>
                <p>No active boards exist in the database.</p>
              </div>
            ) : (
              <div className="admin-cards-grid">
                {boards.map((b) => {
                  const ownerName = b.owner?.fullName || b.owner?.email || b.owner || "Unassigned";
                  const memberCount = Array.isArray(b.members) ? b.members.length : 0;

                  return (
                    <div key={b._id} className="admin-board-card">
                      <div className="admin-board-card-header">
                        <h3>{b.name}</h3>
                        <span className="member-count-badge">{memberCount} Members</span>
                      </div>
                      <p className="admin-board-desc">{b.description || "No description provided."}</p>

                      <div className="admin-board-meta">
                        <div><strong>Owner:</strong> {ownerName}</div>
                        <div><strong>Created:</strong> {new Date(b.createdAt).toLocaleDateString()}</div>
                      </div>

                      <div className="admin-board-actions">
                        <Link to={`/boards/${b._id}`} className="btn-secondary" style={{ textDecoration: "none", textAlign: "center" }}>
                          View Board
                        </Link>
                        <button
                          className="btn-danger-sm"
                          onClick={() => handleDeleteBoard(b)}
                          disabled={deleteBoardMutation.isPending}
                        >
                          Delete Board
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
