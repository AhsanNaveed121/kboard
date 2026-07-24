import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateBoard, deleteBoard, addBoardMember, removeBoardMember } from "../services/boardService";
import { searchUsers } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function BoardSettingsModal({ board, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("edit"); // edit, members, danger
  const [name, setName] = useState(board.name);
  const [description, setDescription] = useState(board.description || "");
  
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [formError, setFormError] = useState("");

  const isAdmin = user?.role === "admin";
  const isOwner = board.owner === user?._id || (board.owner?._id && board.owner._id === user?._id);
  const canManage = isAdmin || isOwner;

  const updateMutation = useMutation({
    mutationFn: () => updateBoard({ id: board._id, name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", board._id] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      onClose();
    },
    onError: (err) => setFormError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteBoard(board._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      queryClient.invalidateQueries({ queryKey: ["adminBoards"] });
      navigate(user?.role === "admin" ? "/admin" : "/boards");
    },
    onError: (err) => setFormError(err.message),
  });

  const addMemberMutation = useMutation({
    mutationFn: (userId) => addBoardMember({ boardId: board._id, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", board._id] });
      setSelectedUserId("");
      setSearchEmail("");
      setSearchResults([]);
      setFormError("");
    },
    onError: (err) => setFormError(err.message),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId) => removeBoardMember({ boardId: board._id, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", board._id] });
      setFormError("");
    },
    onError: (err) => setFormError(err.message),
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    setIsSearching(true);
    setFormError("");
    try {
      const results = await searchUsers(searchEmail.trim());
      setSearchResults(results);
      setSelectedUserId("");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = () => {
    if (!selectedUserId) return;
    addMemberMutation.mutate(selectedUserId);
  };

  const handleDelete = () => {
    if (window.confirm("Are you absolutely sure you want to delete this board and all its columns and tasks? This cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  if (!canManage) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>Access Denied</h2>
          <p>You do not have permission to manage this board.</p>
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h2 style={{ margin: 0 }}>Board Settings</h2>
            <button className="btn-secondary" style={{ padding: "4px 10px", fontSize: "0.85rem", cursor: "pointer" }} onClick={onClose}>Close</button>
        </div>
        
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
          <button className={activeTab === "edit" ? "btn-primary" : "btn-secondary"} onClick={() => setActiveTab("edit")}>Board Details</button>
          <button className={activeTab === "members" ? "btn-primary" : "btn-secondary"} onClick={() => setActiveTab("members")}>Manage Members</button>
          <button className={activeTab === "danger" ? "btn-primary" : "btn-secondary"} onClick={() => setActiveTab("danger")}>Danger Zone</button>
        </div>

        {formError && <div className="form-error" style={{ marginBottom: "15px" }}>{formError}</div>}

        {activeTab === "edit" && (
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Board Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "members" && (
          <div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "bold", display: "block", marginBottom: "6px" }}>Option 1: Search User by Email</label>
              <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px" }}>
                <input 
                  type="text" 
                  placeholder="e.g. user@example.com" 
                  value={searchEmail} 
                  onChange={(e) => setSearchEmail(e.target.value)} 
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn-secondary" disabled={isSearching || !searchEmail}>
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </form>
            </div>

            {searchResults.length > 0 && (
              <div style={{ marginBottom: "20px", padding: "10px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                <p style={{ fontSize: "0.88rem", color: "#374151", marginBottom: "8px", fontWeight: "bold" }}>Select user to add:</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <select 
                    value={selectedUserId} 
                    onChange={(e) => setSelectedUserId(e.target.value)} 
                    style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc", background: "white", color: "black" }}
                  >
                    <option value="">-- Choose a user --</option>
                    {searchResults.map(u => (
                      <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={handleAddMember}
                    disabled={addMemberMutation.isPending || !selectedUserId}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {searchResults.length === 0 && searchEmail && !isSearching && (
              <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "15px" }}>No users found matching this email.</p>
            )}

            <div style={{ margin: "15px 0", borderTop: "1px solid #eee", paddingTop: "15px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "bold", display: "block", marginBottom: "6px" }}>Option 2: Add by Exact User ID</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input 
                  type="text" 
                  placeholder="Paste MongoDB User ID (e.g. 64b...)" 
                  value={selectedUserId} 
                  onChange={(e) => setSelectedUserId(e.target.value)} 
                  style={{ flex: 1 }}
                />
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={handleAddMember}
                  disabled={addMemberMutation.isPending || !selectedUserId}
                >
                  {addMemberMutation.isPending ? "Adding..." : "Add ID"}
                </button>
              </div>
            </div>

            <h4 style={{ margin: "15px 0 10px 0" }}>Current Members</h4>
            {(!board.members || board.members.length === 0) && (
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>No members added yet.</p>
            )}
            <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: "200px", overflowY: "auto" }}>
              {board.members?.map((member) => {
                const isObject = typeof member === "object" && member !== null;
                const mId = isObject ? member._id : member;
                const mName = isObject ? (member.fullName || member.email || mId) : mId;
                const mEmail = isObject ? member.email : "";
                const mPic = isObject ? member.profilePicTag : null;
                
                return (
                  <li key={mId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #eee" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {mPic ? (
                        <img src={mPic} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#0284c7", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.85rem" }}>
                          {mName[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{mName}</div>
                        {mEmail && <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{mEmail}</div>}
                      </div>
                    </div>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: "4px 10px", fontSize: "0.8rem", background: "#fee2e2", color: "#dc2626", borderColor: "#fca5a5", borderRadius: "6px", cursor: "pointer" }}
                      onClick={() => removeMemberMutation.mutate(mId)}
                      disabled={removeMemberMutation.isPending}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {activeTab === "danger" && (
          <div>
            <p style={{ color: "#ef4444", marginBottom: "15px" }}>
              Deleting a board will permanently remove all its columns and tasks. This action cannot be undone.
            </p>
            <button className="btn-primary" style={{ background: "#dc2626", borderColor: "#dc2626", width: "100%" }} onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete Board Permanently"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
