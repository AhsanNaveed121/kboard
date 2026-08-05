import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile, changePassword } from "../services/authService";

function Profile() {
  const { user, login } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback states
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Synchronize state when user object is loaded
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      if (user.dob) {
        setDob(user.dob.split("T")[0]);
      }
    }
  }, [user]);

  // Handle Profile Details Submit
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!fullName.trim()) {
      setProfileError("Full Name is required.");
      return;
    }

    setProfileLoading(true);
    try {
      const response = await updateUserProfile({ fullName, dob });
      // Update global AuthContext state with updated user data
      if (response.data) {
        login(response.data);
      }
      setProfileSuccess("Profile details updated successfully!");
    } catch (err) {
      setProfileError(err.message || "Failed to update profile details");
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Change Submit
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({ oldPassword, newPassword });
      setPasswordSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <main className="settings-page">
      <div className="settings-container">
        <div className="board-nav" style={{ marginBottom: "1.5rem" }}>
          <Link to={user?.role ? "/" : "/login"} className="back-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back to Dashboard
          </Link>
        </div>
        <h1>User Profile</h1>

        {/* Profile Overview Card */}
        {user && (
          <section className="settings-card" style={{ textAlign: "center" }}>
            {user.profilePicTag ? (
              <img
                src={user.profilePicTag}
                alt="Profile Avatar"
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #2563eb",
                  marginBottom: "12px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  background: "#2563eb",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: "bold",
                  margin: "0 auto 12px",
                }}
              >
                {user.fullName ? user.fullName[0].toUpperCase() : "U"}
              </div>
            )}
            <h2 style={{ marginBottom: "4px" }}>{user.fullName}</h2>
            <p style={{ color: "#64748b", margin: 0 }}>{user.email}</p>
          </section>
        )}

        {/* Personal Information */}
        <section className="settings-card">
          <h2>Personal Details</h2>

          {profileError && <p className="form-error">{profileError}</p>}
          {profileSuccess && <p className="form-success">{profileSuccess}</p>}

          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label style={{ display: "flex", justifyContent: "space-between" }}>
                Email Address
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "normal" }}>
                  🔒 Email cannot be changed
                </span>
              </label>
              <input
                type="email"
                value={email}
                disabled
                style={{
                  backgroundColor: "rgba(148, 163, 184, 0.15)",
                  color: "#64748b",
                  cursor: "not-allowed",
                }}
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <button type="submit" disabled={profileLoading}>
              {profileLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>
        {/* Change Password */}
        {!user?.providerId && (
          <section className="settings-card">
            <h2>Change Password</h2>

            {passwordError && <p className="form-error">{passwordError}</p>}
            {passwordSuccess && <p className="form-success">{passwordSuccess}</p>}

            <form onSubmit={handlePasswordSave}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password (min. 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </section>
        )}

        {/* Danger Zone */}
        <section className="settings-card danger">
          <h2>Danger Zone</h2>
          <p style={{ color: "#64748b", marginBottom: "16px" }}>
            Permanently delete your account and all associated boards and tasks. This action cannot be undone.
          </p>
          <button className="delete-btn" type="button">Delete Account</button>
        </section>
      </div>
    </main>
  );
}

export default Profile;
