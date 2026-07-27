export default function TaskCard({ task, currentUser, isBoardOwner, onEditTask, onDeleteTask, onDragStart }) {
  const currentUserId = currentUser?._id;
  const isAssignee = task.assignedTo && (task.assignedTo._id === currentUserId || task.assignedTo === currentUserId);
  const canMove = isBoardOwner || isAssignee;
  const canEditOrDelete = isBoardOwner;

  const priorityColorClass = {
    high: "priority-high",
    medium: "priority-medium",
    low: "priority-low",
  }[task.priority || "medium"];

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;

  const assigneeName = task.assignedTo
    ? (task.assignedTo.fullName || task.assignedTo.email || "Assigned User")
    : null;

  return (
    <div
      className={`task-card priority-card-${task.priority || "medium"} ${canMove ? "is-draggable" : "is-locked"}`}
      draggable={canMove}
      onDragStart={(e) => canMove && onDragStart(e, task)}
    >
      <div className="task-card-header">
        <span className={`priority-badge ${priorityColorClass}`}>
          {task.priority || "medium"}
        </span>
        {!canMove && (
          <span className="task-lock-tag" title="You can only move tasks assigned to you">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Locked
          </span>
        )}
        {canEditOrDelete && (
          <div className="task-card-actions">
            <button
              type="button"
              className="task-action-btn edit-btn"
              title="Edit Task"
              onClick={() => onEditTask(task)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              type="button"
              className="task-action-btn delete-btn"
              title="Delete Task"
              onClick={() => onDeleteTask(task._id)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        )}
      </div>

      <h4 className="task-title">{task.title}</h4>
      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-card-footer">
        {formattedDueDate ? (
          <span className="task-due-date" title="Due Date">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {formattedDueDate}
          </span>
        ) : <span />}

        {task.assignedTo ? (
          <div className="task-assignee-pill" title={`Assigned to ${assigneeName}`}>
            {task.assignedTo.profilePicTag ? (
              <img src={task.assignedTo.profilePicTag} alt="" className="assignee-avatar" />
            ) : (
              <div className="assignee-badge">
                {assigneeName[0].toUpperCase()}
              </div>
            )}
            <span className="assignee-name">{assigneeName}</span>
          </div>
        ) : (
          <span className="unassigned-pill">Unassigned</span>
        )}
      </div>
    </div>
  );
}
