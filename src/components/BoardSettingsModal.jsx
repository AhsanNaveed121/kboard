import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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
      setFormError("");
    },
    onError: (err) => setFormError(err.message),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId) => removeBoardMember({ boardId: board._id, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", board._id] });
      queryClient.invalidateQueries({ queryKey: ["tasks", board._id] });
      setFormError("");
    },
    onError: (err) => setFormError(err.message),
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  // Debounced search on typing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setFormError("");
      try {
        const results = await searchUsers(searchQuery.trim());
        setSearchResults(results || []);
      } catch (err) {
        setFormError(err.message || "Failed to search users");
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDelete = () => {
    if (window.confirm("Are you absolutely sure you want to delete this board and all its columns and tasks? This cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  const isAlreadyMember = (userId) => {
    if (board.owner === userId || board.owner?._id === userId) return true;
    return board.members?.some(m => (m._id || m) === userId);
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
      <div className="modal-content settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Board Settings</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-tabs">
          <button className={activeTab === "edit" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveTab("edit")}>Board Details</button>
          <button className={activeTab === "members" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveTab("members")}>Manage Members</button>
          <button className={activeTab === "danger" ? "tab-btn active danger" : "tab-btn danger"} onClick={() => setActiveTab("danger")}>Danger Zone</button>
        </div>

        {formError && <div className="form-error">{formError}</div>}

        {activeTab === "edit" && (
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Board Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
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
          <div className="members-tab-container">
            <div className="member-search-box">
              <label className="search-label">Find People to Add</label>
              <div className="search-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Search by name or email address..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="search-input"
                />
                {isSearching && <span className="search-spinner">Searching...</span>}
              </div>
            </div>

            {/* Live Search User Card List - NO Dropdowns or DB ID search */}
            {searchResults.length > 0 && (
              <div className="search-results-list">
                <span className="results-heading">Matching Users</span>
                {searchResults.map((u) => {
                  const added = isAlreadyMember(u._id);
                  return (
                    <div key={u._id} className="user-search-card">
                      <div className="user-info-group">
                        {u.profilePicTag ? (
                          <img src={u.profilePicTag} alt="" className="avatar-img" />
                        ) : (
                          <div className="avatar-placeholder">{u.fullName?.[0]?.toUpperCase() || "U"}</div>
                        )}
                        <div>
                          <div className="user-name">{u.fullName}</div>
                          <div className="user-email">{u.email}</div>
                        </div>
                      </div>
                      {added ? (
                        <span className="badge-member">Member</span>
                      ) : (
                        <button
                          type="button"
                          className="btn-add-member"
                          onClick={() => addMemberMutation.mutate(u._id)}
                          disabled={addMemberMutation.isPending}
                        >
                          Add Member
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isSearching && (
              <p className="no-results-msg">No users matching &quot;{searchQuery}&quot;</p>
            )}

            <div className="members-section">
              <h4>Current Members ({board.members?.length || 0})</h4>
              {(!board.members || board.members.length === 0) && (
                <p className="empty-members-msg">No members added yet.</p>
              )}
              <div className="members-list">
                {board.members?.map((member) => {
                  const isObject = typeof member === "object" && member !== null;
                  const mId = isObject ? member._id : member;
                  const mName = isObject ? (member.fullName || member.email || mId) : mId;
                  const mEmail = isObject ? member.email : "";
                  const mPic = isObject ? member.profilePicTag : null;
                  
                  return (
                    <div key={mId} className="member-card">
                      <div className="user-info-group">
                        {mPic ? (
                          <img src={mPic} alt="" className="avatar-img" />
                        ) : (
                          <div className="avatar-placeholder">{mName[0]?.toUpperCase() || "U"}</div>
                        )}
                        <div>
                          <div className="user-name">{mName}</div>
                          {mEmail && <div className="user-email">{mEmail}</div>}
                        </div>
                      </div>
                      <button 
                        type="button"
                        className="btn-remove-member"
                        onClick={() => removeMemberMutation.mutate(mId)}
                        disabled={removeMemberMutation.isPending}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "danger" && (
          <div className="danger-zone-container">
            <p className="danger-warning">
              Deleting this board will permanently purge all columns and tasks associated with it. This action cannot be undone.
            </p>
            <button className="btn-danger-large" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete Board Permanently"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
