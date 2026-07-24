import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getBoardById } from "../services/boardService";
import {
  getColumnsByBoard,
  createColumn,
  createDefaultColumns,
  deleteColumn,
} from "../services/columnService";
import BoardSettingsModal from "../components/BoardSettingsModal";

function BoardDetails() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [formError, setFormError] = useState("");

  const {
    data: boardResponse,
    isLoading: boardLoading,
    isError: boardIsError,
    error: boardError,
  } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => getBoardById(boardId),
    enabled: !!user && !!boardId,
  });

  const {
    data: columnsResponse,
    isLoading: columnsLoading,
    isError: columnsIsError,
    error: columnsError,
  } = useQuery({
    queryKey: ["columns", boardId],
    queryFn: () => getColumnsByBoard(boardId),
    enabled: !!user && !!boardId,
  });
  const createColMutation = useMutation({
    mutationFn: (title) => createColumn({ title, boardId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
      setNewColumnTitle("");
      setFormError("");
      setShowAddColumnModal(false);
    },
    onError: (err) => {
      setFormError(err.message || "Failed to create column");
    },
  });

  const defaultColsMutation = useMutation({
    mutationFn: () => createDefaultColumns(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
    },
    onError: (err) => {
      alert(err.message || "Failed to initialize default columns");
    },
  });

  // Mutation: Delete column
  const deleteColMutation = useMutation({
    mutationFn: (colId) => deleteColumn(colId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
    },
    onError: (err) => {
      alert(err.message || "Failed to delete column");
    },
  });

  const handleAddColumnSubmit = (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) {
      setFormError("Column title is required");
      return;
    }
    createColMutation.mutate(newColumnTitle.trim());
  };

  const handleDeleteColumn = (colId, colTitle) => {
    if (window.confirm(`Are you sure you want to delete the column "${colTitle}"?`)) {
      deleteColMutation.mutate(colId);
    }
  };

  if (authLoading || (user && (boardLoading || columnsLoading))) {
    return (
      <main className="board-details-page">
        <div className="board-details-container">
          <div className="loading-state">
            <h2>Loading board details...</h2>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="board-details-page">
        <div className="board-details-container">
          <div className="boards-auth-error">
            <h1>Authentication Required</h1>
            <p>Please log in to access this Kanban board.</p>
            <div className="error-actions">
              <Link to="/login">
                <button className="btn-primary">Log In</button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Board Fetch Error
  if (boardIsError) {
    return (
      <main className="board-details-page">
        <div className="board-details-container">
          <div className="boards-auth-error">
            <h1>Board Unavailable</h1>
            <p>{boardError?.message || "Unable to access board details."}</p>
            <button className="btn-primary" onClick={() => navigate(user?.role === "admin" ? "/admin" : "/boards")}>
              Back to Boards
            </button>
          </div>
        </div>
      </main>
    );
  }

  const board = boardResponse?.data || {};
  const columns = Array.isArray(columnsResponse?.data) ? columnsResponse.data : [];

  return (
    <main className="board-details-page">
      <div className="board-details-container">
        
        <div className="board-nav">
          <Link to={user?.role === "admin" ? "/admin" : "/boards"} className="back-link">
            Back to Boards
          </Link>
        </div>

        <header className="board-header">
          <div>
            <h1>{board.name || "Kanban Board"}</h1>
            {board.description && <p className="board-description">{board.description}</p>}
          </div>

          <div className="board-actions">
            {(user?.role === "admin" || board.owner === user?._id || board.owner?._id === user?._id) && (
              <button
                className="btn-secondary"
                onClick={() => setShowSettingsModal(true)}
                style={{ marginRight: "10px" }}
              >
                Board Settings
              </button>
            )}
            <button
              className="btn-primary"
              onClick={() => setShowAddColumnModal(true)}
            >
              Add Column
            </button>

            {columns.length === 0 && (
              <button
                className="btn-secondary"
                onClick={() => defaultColsMutation.mutate()}
                disabled={defaultColsMutation.isPending}
              >
                {defaultColsMutation.isPending ? "Generating..." : "Add Standard Columns"}
              </button>
            )}
          </div>
        </header>

        {columnsIsError && (
          <div className="form-error" style={{ marginBottom: "20px" }}>
            {columnsError?.message || "Failed to load columns for this board."}
          </div>
        )}

        {/* --- Empty State vs Columns View --- */}
        {columns.length === 0 && !columnsIsError ? (
          <section className="columns-empty-state">
            <h2>Board columns are empty</h2>
            <p>Define your workflow columns or generate standard To Do, In Progress, and Done stages.</p>
            <div className="empty-actions">
              <button
                className="btn-primary"
                onClick={() => setShowAddColumnModal(true)}
              >
                Add Column
              </button>
              <button
                className="btn-secondary"
                onClick={() => defaultColsMutation.mutate()}
                disabled={defaultColsMutation.isPending}
              >
                {defaultColsMutation.isPending ? "Generating..." : "Generate Default Workflow (To Do, In Progress, Done)"}
              </button>
            </div>
          </section>
        ) : (
          <section className="kanban-board-grid">
            {columns.map((col) => (
              <div key={col._id} className="kanban-column">
                
                <div className="column-header">
                  <div className="column-title-group">
                    <h3>{col.title}</h3>
                  </div>
                  <button
                    className="col-delete-btn"
                    title="Delete Column"
                    onClick={() => handleDeleteColumn(col._id, col.title)}
                    disabled={deleteColMutation.isPending}
                  >
                    Delete
                  </button>
                </div>

                <div className="column-body">
                  <div className="task-empty-placeholder">
                    <span>No tasks</span>
                  </div>
                </div>

                <div className="column-footer">
                  <button className="add-task-btn" disabled>
                    Add Task
                  </button>
                </div>

              </div>
            ))}

            <div className="add-column-card" onClick={() => setShowAddColumnModal(true)}>
              <div className="add-column-card-content">
                <span>+ Add Column</span>
              </div>
            </div>

          </section>
        )}

        {showAddColumnModal && (
          <div className="modal-overlay" onClick={() => setShowAddColumnModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Add New Column</h2>
              <p className="modal-subtitle">Add a status column to organize tasks for <strong>{board.name}</strong>.</p>
              
              {formError && <div className="form-error">{formError}</div>}
              
              <form onSubmit={handleAddColumnSubmit}>
                <div className="form-group">
                  <label htmlFor="colTitle">Column Title *</label>
                  <input
                    id="colTitle"
                    type="text"
                    placeholder="e.g. Backlog, Testing, Approved"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    autoFocus
                    disabled={createColMutation.isPending}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowAddColumnModal(false);
                      setFormError("");
                    }}
                    disabled={createColMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={createColMutation.isPending}
                  >
                    {createColMutation.isPending ? "Creating..." : "Create Column"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {showSettingsModal && (
          <BoardSettingsModal board={board} onClose={() => setShowSettingsModal(false)} />
        )}

      </div>
    </main>
  );
}

export default BoardDetails;
