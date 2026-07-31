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
import {
  getTasksByBoard,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";
import BoardSettingsModal from "../components/BoardSettingsModal";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";

function BoardDetails() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [formError, setFormError] = useState("");

  // Task Modal state
  const [taskModalState, setTaskModalState] = useState({
    isOpen: false,
    columnId: null,
    task: null, // null for create, task object for edit
  });

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null);

  // Queries
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

  const {
    data: tasksResponse,
    isLoading: tasksLoading,
    isError: tasksIsError,
    error: tasksError,
  } = useQuery({
    queryKey: ["tasks", boardId],
    queryFn: () => getTasksByBoard(boardId),
    enabled: !!user && !!boardId,
  });

  // Column Mutations
  const createColMutation = useMutation({
    mutationFn: (title) => createColumn({ title, boardId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
      setNewColumnTitle("");
      setFormError("");
      setShowAddColumnModal(false);
    },
    onError: (err) => setFormError(err.message || "Failed to create column"),
  });

  const defaultColsMutation = useMutation({
    mutationFn: () => createDefaultColumns(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
    },
    onError: (err) => alert(err.message || "Failed to initialize default columns"),
  });

  const deleteColMutation = useMutation({
    mutationFn: (colId) => deleteColumn(colId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
    onError: (err) => alert(err.message || "Failed to delete column"),
  });

  // Task Mutations
  const createTaskMutation = useMutation({
    mutationFn: (taskData) => createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
      setTaskModalState({ isOpen: false, columnId: null, task: null });
    },
    onError: (err) => alert(err.message || "Failed to create task"),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }) => updateTask(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
      setTaskModalState({ isOpen: false, columnId: null, task: null });
    },
    onError: (err) => alert(err.message || "Failed to update task"),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
    onError: (err) => alert(err.message || "Failed to delete task"),
  });

  // Column Handlers
  const handleAddColumnSubmit = (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) {
      setFormError("Column title is required");
      return;
    }
    createColMutation.mutate(newColumnTitle.trim());
  };

  const handleDeleteColumn = (colId, colTitle) => {
    if (window.confirm(`Are you sure you want to delete column "${colTitle}" and all its tasks?`)) {
      deleteColMutation.mutate(colId);
    }
  };

  // Task Handlers
  const handleOpenCreateTask = (columnId) => {
    setTaskModalState({ isOpen: true, columnId, task: null });
  };

  const handleOpenEditTask = (task) => {
    setTaskModalState({ isOpen: true, columnId: task.column, task });
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleTaskSubmit = (payload) => {
    if (taskModalState.task) {
      updateTaskMutation.mutate({ taskId: taskModalState.task._id, updates: payload });
    } else {
      createTaskMutation.mutate(payload);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData("text/plain", task._id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedTaskId(task._id);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumnId !== columnId) {
      setDragOverColumnId(columnId);
    }
  };

  const handleDragLeave = (e, columnId) => {
    e.preventDefault();
    if (dragOverColumnId === columnId) {
      setDragOverColumnId(null);
    }
  };

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();
    setDragOverColumnId(null);
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    setDraggedTaskId(null);

    if (!taskId) return;

    const allTasks = Array.isArray(tasksResponse?.data) ? tasksResponse.data : [];
    const taskObj = allTasks.find((t) => t._id === taskId);
    if (!taskObj) return;

    const isAssignee = taskObj.assignedTo && (taskObj.assignedTo._id === user?._id || taskObj.assignedTo === user?._id);
    const canMoveTask = isOwner || isAssignee;

    if (!canMoveTask) {
      alert("Permission denied: You can only move tasks assigned to you.");
      return;
    }

    if ((taskObj.column?._id || taskObj.column) !== targetColumnId) {
      updateTaskMutation.mutate({
        taskId,
        updates: { column: targetColumnId },
      });
    }
  };

  if (authLoading || (user && (boardLoading || columnsLoading || tasksLoading))) {
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
  const tasks = Array.isArray(tasksResponse?.data) ? tasksResponse.data : [];

  const isOwner = user?.role === "admin" || board.owner === user?._id || board.owner?._id === user?._id;
  const boardMembers = [
    ...(board.owner ? [board.owner] : []),
    ...(Array.isArray(board.members) ? board.members : []),
  ];

  return (
    <main className="board-details-page">
      <div className="board-details-container">
        
        <div className="board-nav">
          <Link to={user?.role === "admin" ? "/admin" : "/boards"} className="back-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Boards
          </Link>
        </div>

        <header className="board-header">
          <div>
            <h1>{board.name || "Kanban Board"}</h1>
            {board.description && (
              <p className="board-description">{board.description}</p>
            )}
          </div>

          <div className="board-actions">
            {isOwner && (
              <>
                <button
                  className="btn-secondary"
                  onClick={() => setShowSettingsModal(true)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  Board Settings
                </button>
                <button
                  className="btn-primary"
                  onClick={() => setShowAddColumnModal(true)}
                >
                  + Add Column
                </button>
              </>
            )}
            {isOwner && columns.length === 0 && (
              <button
                className="btn-secondary"
                onClick={() => defaultColsMutation.mutate()}
                disabled={defaultColsMutation.isPending}
              >
                {defaultColsMutation.isPending ? "Generating…" : "Add Standard Columns"}
              </button>
            )}
          </div>
        </header>

        {(columnsIsError || tasksIsError) && (
          <div className="form-error" style={{ marginBottom: "20px" }}>
            {columnsError?.message || tasksError?.message || "Failed to load board resources."}
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
                + Add Column
              </button>
              <button
                className="btn-secondary"
                onClick={() => defaultColsMutation.mutate()}
                disabled={defaultColsMutation.isPending}
              >
                {defaultColsMutation.isPending ? "Generating..." : "Generate Default Workflow"}
              </button>
            </div>
          </section>
        ) : (
          <section className="kanban-board-grid">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => {
                const cId = t.column?._id || t.column;
                return cId === col._id;
              });

              const isDragOver = dragOverColumnId === col._id;

              // Assign a color per column index for the dot indicator
              const colColors = ["#6366f1", "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#06b6d4"];
              const colIdx = columns.findIndex((c) => c._id === col._id);
              const dotColor = colColors[colIdx % colColors.length];

              return (
                <div
                  key={col._id}
                  className={`kanban-column ${isDragOver ? "drag-over" : ""}`}
                  onDragOver={(e) => handleDragOver(e, col._id)}
                  onDragLeave={(e) => handleDragLeave(e, col._id)}
                  onDrop={(e) => handleDrop(e, col._id)}
                >
                  <div className="column-header">
                    <div className="column-title-group">
                      <span className="column-color-dot" style={{ background: dotColor }} />
                      <h3>{col.title}</h3>
                      <span className="task-count-badge">{colTasks.length}</span>
                    </div>
                    {isOwner && (
                      <button
                        className="col-delete-btn"
                        title="Delete Column"
                        onClick={() => handleDeleteColumn(col._id, col.title)}
                        disabled={deleteColMutation.isPending}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="column-body">
                    {colTasks.length === 0 ? (
                      <div className="task-empty-placeholder">
                        <span>Drop tasks here</span>
                      </div>
                    ) : (
                      colTasks.map((t) => (
                        <TaskCard
                          key={t._id}
                          task={t}
                          currentUser={user}
                          isBoardOwner={isOwner}
                          onEditTask={handleOpenEditTask}
                          onDeleteTask={handleDeleteTask}
                          onDragStart={handleDragStart}
                        />
                      ))
                    )}
                  </div>

                  {isOwner && (
                    <div className="column-footer">
                      <button
                        type="button"
                        className="add-task-btn"
                        onClick={() => handleOpenCreateTask(col._id)}
                      >
                        + Add Task
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {isOwner && (
              <div className="add-column-card" onClick={() => setShowAddColumnModal(true)}>
                <div className="add-column-card-content">
                  <span>+ Add Column</span>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Add Column Modal */}
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

        {/* Task Create/Edit Modal */}
        {taskModalState.isOpen && (
          <TaskModal
            task={taskModalState.task}
            columnId={taskModalState.columnId}
            boardMembers={boardMembers}
            onClose={() => setTaskModalState({ isOpen: false, columnId: null, task: null })}
            onSubmit={handleTaskSubmit}
            isPending={createTaskMutation.isPending || updateTaskMutation.isPending}
          />
        )}

        {/* Board Settings Modal */}
        {showSettingsModal && (
          <BoardSettingsModal board={board} onClose={() => setShowSettingsModal(false)} />
        )}

      </div>
    </main>
  );
}

export default BoardDetails;
