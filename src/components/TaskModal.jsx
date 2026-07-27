import { useState } from "react";

export default function TaskModal({ task, columnId, boardMembers = [], onClose, onSubmit, isPending }) {
  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().substring(0, 10) : ""
  );
  const [assignedTo, setAssignedTo] = useState(
    task?.assignedTo?._id || task?.assignedTo || ""
  );
  const [formError, setFormError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Task title is required");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || null,
      assignedTo: assignedTo || null,
      column: columnId || task?.column,
    };

    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? "Edit Task" : "Create New Task"}</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        {formError && <div className="form-error">{formError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="taskTitle">Task Title *</label>
            <input
              id="taskTitle"
              type="text"
              placeholder="e.g. Design Landing Page Wireframe"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              disabled={isPending}
            />
          </div>

          <div className="form-group">
            <label htmlFor="taskDescription">Description</label>
            <textarea
              id="taskDescription"
              rows={3}
              placeholder="Add additional details or context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="taskPriority">Priority</label>
              <select
                id="taskPriority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={isPending}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="form-group half-width">
              <label htmlFor="taskDueDate">Due Date</label>
              <input
                id="taskDueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="taskAssignee">Assign To Member</label>
            <select
              id="taskAssignee"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              disabled={isPending}
            >
              <option value="">Unassigned</option>
              {boardMembers.map((m) => {
                const id = m._id || m;
                const name = m.fullName || m.email || id;
                return (
                  <option key={id} value={id}>
                    {name} {m.email ? `(${m.email})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isPending}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Task")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
