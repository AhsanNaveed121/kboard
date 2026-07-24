import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getBoards, createBoard } from "../services/boardService";

function Boards() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDesc, setNewBoardDesc] = useState("");
  const [formError, setFormError] = useState("");

  // TanStack Query to fetch user boards from API
  const {
    data: boardsResponse,
    isLoading: boardsLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["boards"],
    queryFn: getBoards,
    enabled: !!user // Execute only when authenticated
  });

  // Mutation to create a board
  const createBoardMutation = useMutation({
    mutationFn: createBoard,
    onSuccess: () => {
      // Auto-refetch boards list
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      setNewBoardName("");
      setNewBoardDesc("");
      setFormError("");
      setShowModal(false);
    },
    onError: (err) => {
      setFormError(err.message || "Failed to create board");
    }
  });

  const handleCreateBoard = (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) {
      setFormError("Board name is required");
      return;
    }

    createBoardMutation.mutate({
      name: newBoardName.trim(),
      description: newBoardDesc.trim()
    });
  };

  // 1. Loading State
  if (authLoading || (user && boardsLoading)) {
    return (
      <div className="boards-page">
        <div className="boards-container">
          <div className="boards-loading">
            <h2>Loading your boards...</h2>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authentication Error State (Not logged in)
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

  // Safely extract array from ApiResponse (backend returns data inside response payload)
  const boards = Array.isArray(boardsResponse?.data) ? boardsResponse.data : (Array.isArray(boardsResponse) ? boardsResponse : []);

  // 3. Logged-in Dashboard View
  return (
    <div className="boards-page">
      <div className="boards-container">
        
        {/* Admin mode notice */}
        {user?.role === "admin" && (
          <div style={{
            background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
            color: "white",
            padding: "12px 20px",
            borderRadius: "10px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)"
          }}>
            <div>
              <strong style={{ fontSize: "1.05rem" }}>Administrator Session Active</strong>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.88rem", opacity: 0.9 }}>
                You have system-wide access to user account management and board oversight.
              </p>
            </div>
            <Link to="/admin" className="btn-primary" style={{ background: "white", color: "#0284c7", fontWeight: "bold", textDecoration: "none", whiteSpace: "nowrap" }}>
              Admin Control Panel
            </Link>
          </div>
        )}

        {/* Header Bar */}
        <div className="boards-header">
          <div>
            <h1>{user?.role === "admin" ? "All System Boards" : "My Boards"}</h1>
            <p className="welcome-text">Welcome back, <strong>{user.fullName || user.username}</strong></p>
          </div>
          {user?.role !== "admin" && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              Create Board
            </button>
          )}
        </div>

        {/* Server Fetch Error Banner */}
        {isError && (
          <div className="form-error" style={{ marginBottom: "24px" }}>
            {error?.message || "Failed to load boards."}
          </div>
        )}

        {/* Boards Grid */}
        {boards.length === 0 && !isError ? (
          <div className="boards-empty-state">
            <h2>No Boards Created Yet</h2>
            <p>Get started by creating your first board to organize your tasks.</p>
            {user?.role !== "admin" && (
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                Create Board
              </button>
            )}
          </div>
        ) : (
          <div className="boards-grid">
            {boards.map((board) => (
              <div key={board._id} className="board-card">
                <h3>{board.name}</h3>
                <p>{board.description || "No description provided."}</p>
                <div className="board-card-footer">
                  <span className="board-date">
                    Created {new Date(board.createdAt).toLocaleDateString()}
                  </span>
                  <Link to={`/boards/${board._id}`} className="view-board-link">
                    Open Board
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for creating board */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Board</h2>
              {formError && <div className="form-error">{formError}</div>}
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
                    {createBoardMutation.isPending ? "Creating..." : "Create Board"}
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
