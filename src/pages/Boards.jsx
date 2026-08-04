import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getBoards, createBoard, leaveBoard } from "../services/boardService";

function Boards() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDesc, setNewBoardDesc] = useState("");
  const [formError, setFormError] = useState("");

  const leaveBoardMutation = useMutation({
    mutationFn: leaveBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
    onError: (err) => {
      alert(err.message || "Failed to leave board");
    },
  });

  const {
    data: boardsResponse,
    isLoading: boardsLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["boards"],
    queryFn: getBoards,
    enabled: !!user,
  });

  const createBoardMutation = useMutation({
    mutationFn: createBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      setNewBoardName("");
      setNewBoardDesc("");
      setFormError("");
      setShowModal(false);
    },
    onError: (err) => {
      setFormError(err.message || "Failed to create board");
    },
  });

  const handleCreateBoard = (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) {
      setFormError("Board name is required");
      return;
    }
    createBoardMutation.mutate({
      name: newBoardName.trim(),
      description: newBoardDesc.trim(),
    });
  };

  // Loading State
  if (authLoading || (user && boardsLoading)) {
    return (
      <div className="boards-page">
        <div className="boards-container">
          <div className="boards-loading">
            <h2>Loading your boards…</h2>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="boards-page">
        <div className="boards-container">
          <div className="boards-auth-error">
            <h1>Authentication Required</h1>
            <p>You must be logged in to view and manage your Kanban boards.</p>
            <div className="error-actions">
              <Link to="/login">
                <button className="btn-primary">Log In</button>
              </Link>
              <Link to="/register">
                <button className="btn-secondary">Create Account</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const boards = Array.isArray(boardsResponse?.data)
    ? boardsResponse.data
    : Array.isArray(boardsResponse)
    ? boardsResponse
    : [];

  return (
    <div className="boards-page">
      <div className="boards-container">

        {/* Admin notice */}
        {user?.role === "admin" && (
          <div className="admin-session-banner">
            <div>
              <strong>Administrator Session Active</strong>
              <p>
                You have system-wide access to user account management and board
                oversight.
              </p>
            </div>
            <Link
              to="/admin"
              className="btn-primary"
              style={{ whiteSpace: "nowrap", textDecoration: "none" }}
            >
              Admin Control Panel
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="boards-header">
          <div>
            <h1>
              {user?.role === "admin" ? "All System Boards" : "My Boards"}
            </h1>
            <p className="welcome-text">
              Welcome back,{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {user.fullName || user.username}
              </strong>
              {boards.length > 0 && (
                <>
                  . You have{" "}
                  <strong style={{ color: "var(--indigo)" }}>
                    {boards.length}
                  </strong>{" "}
                  active board{boards.length !== 1 ? "s" : ""}.
                </>
              )}
            </p>
          </div>
          {user?.role !== "admin" && (
            <button
              className="btn-primary"
              onClick={() => setShowModal(true)}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              CREATE BOARD
            </button>
          )}
        </div>

        {/* Fetch Error */}
        {isError && (
          <div className="form-error" style={{ marginBottom: "24px" }}>
            {error?.message || "Failed to load boards."}
          </div>
        )}

        {/* Boards Grid */}
        {boards.length === 0 && !isError ? (
          <div className="boards-empty-state">
            <h2>No Boards Created Yet</h2>
            <p>
              Get started by creating your first board to organize your tasks.
            </p>
            {user?.role !== "admin" && (
              <button
                className="btn-primary"
                onClick={() => setShowModal(true)}
                style={{ margin: "0 auto" }}
              >
                Create Board
              </button>
            )}
          </div>
        ) : (
          <div className="boards-grid">
            {boards.map((board) => {
              const isActualOwner = board.owner === user?._id || board.owner?._id === user?._id;
              return (
                <div key={board._id} className="board-card">
                  <div>
                    <h3>{board.name}</h3>
                    <p>{board.description || "No description provided for this board."}</p>
                  </div>
                  <div className="board-card-footer">
                    <span className="board-date">
                      {new Date(board.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {!isActualOwner && (
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: "4px 8px", fontSize: "0.75rem", color: "var(--red, #ef4444)" }}
                          onClick={(e) => {
                            e.preventDefault();
                            if (window.confirm(`Leave board "${board.name}"?`)) {
                              leaveBoardMutation.mutate(board._id);
                            }
                          }}
                          disabled={leaveBoardMutation.isPending}
                        >
                          Leave
                        </button>
                      )}
                      <Link
                        to={`/boards/${board._id}`}
                        className="view-board-link"
                      >
                        Open Board →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* New Board Card */}
            {user?.role !== "admin" && (
              <div
                className="new-board-card"
                onClick={() => setShowModal(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setShowModal(true)}
              >
                <div className="new-board-plus">+</div>
                <span className="new-board-label">New Board</span>
              </div>
            )}
          </div>
        )}

        {/* Create Board Modal */}
        {showModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowModal(false)}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Create New Board</h2>
              <p className="modal-subtitle">
                Set up a new Kanban board for your project or team.
              </p>

              {formError && (
                <div className="form-error">{formError}</div>
              )}

              <form onSubmit={handleCreateBoard}>
                <div className="form-group">
                  <label>Board Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Website Redesign"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    autoFocus
                    disabled={createBoardMutation.isPending}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Sprint board for frontend tasks"
                    value={newBoardDesc}
                    onChange={(e) => setNewBoardDesc(e.target.value)}
                    disabled={createBoardMutation.isPending}
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={createBoardMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={createBoardMutation.isPending}
                  >
                    {createBoardMutation.isPending
                      ? "Creating…"
                      : "Create Board"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Boards;
