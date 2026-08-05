import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Settings() {
  const { user } = useAuth();
  const [compactView, setCompactView] = useState(
    () => localStorage.getItem("compactView") === "true"
  );
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem("compactView", compactView);
    setSavedMessage("System settings saved!");
    setTimeout(() => setSavedMessage(""), 3000);
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
        <h1>System Settings</h1>

        {savedMessage && <p className="form-success">{savedMessage}</p>}

        {/* Board Preferences */}
        <section className="settings-card">
          <h2>Board Preferences</h2>

          <div
            className="form-group"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <label style={{ margin: 0, color: "var(--text-primary)" }}>
                Compact Card Layout
              </label>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "4px 0 0" }}>
                Display task cards in a denser layout to see more at once.
              </p>
            </div>
            <input
              type="checkbox"
              checked={compactView}
              onChange={(e) => setCompactView(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--indigo)" }}
            />
          </div>
        </section>

        {/* Notifications */}
        <section className="settings-card">
          <h2>Notifications &amp; Sound</h2>

          <div
            className="form-group"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "18px",
            }}
          >
            <div>
              <label style={{ margin: 0, color: "var(--text-primary)" }}>
                Email Activity Digest
              </label>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "4px 0 0" }}>
                Receive email updates when tasks are assigned or updated.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--indigo)" }}
            />
          </div>

          <div
            className="form-group"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <label style={{ margin: 0, color: "var(--text-primary)" }}>
                Task Move Sound Effects
              </label>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "4px 0 0" }}>
                Play a sound when dragging cards across columns.
              </p>
            </div>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={(e) => setSoundEffects(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--indigo)" }}
            />
          </div>
        </section>

        <button
          onClick={handleSaveSettings}
          className="btn-primary"
          style={{ width: "100%", padding: "14px", justifyContent: "center", fontSize: "0.95rem" }}
        >
          Save Settings
        </button>
      </div>
    </main>
  );
}

export default Settings;