import { useState, useEffect } from "react";

function Settings() {
  // Theme state stored in localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const [compactView, setCompactView] = useState(() => {
    return localStorage.getItem("compactView") === "true";
  });

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem("compactView", compactView);
    setSavedMessage("System settings saved!");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  return (
    <main className="settings-page">
      <div className="settings-container">
        <h1>System Settings</h1>

        {savedMessage && <p className="form-success">{savedMessage}</p>}

        {/* 1. Appearance & Theme Settings */}
        <section className="settings-card">
          <h2>Appearance & Theme</h2>
          <p style={{ color: "#64748b", marginBottom: "16px" }}>
            Customize how your Kanban workspace looks and feels.
          </p>

          <div className="form-group">
            <label>Interface Theme</label>
            <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => setTheme("light")}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: theme === "light" ? "#2563eb" : "#f1f5f9",
                  color: theme === "light" ? "white" : "#334155",
                  border: theme === "light" ? "none" : "1px solid #cbd5e1",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                ☀️ Light Mode
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: theme === "dark" ? "#2563eb" : "#f1f5f9",
                  color: theme === "dark" ? "white" : "#334155",
                  border: theme === "dark" ? "none" : "1px solid #cbd5e1",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                🌙 Dark Mode
              </button>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <h2>Board Preferences</h2>

          <div className="form-group" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <label style={{ margin: 0 }}>Compact Card Layout</label>
              <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                Display task cards in a denser layout to see more cards at once.
              </p>
            </div>
            <input
              type="checkbox"
              checked={compactView}
              onChange={(e) => setCompactView(e.target.checked)}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
          </div>
        </section>

        {/* 3. Notifications & System sound */}
        <section className="settings-card">
          <h2>Notifications & Sound</h2>

          <div className="form-group" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <label style={{ margin: 0 }}>Email Activity Digest</label>
              <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                Receive email updates when tasks are assigned or updated.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
          </div>

          <div className="form-group" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <label style={{ margin: 0 }}>Task Move Sound Effects</label>
              <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                Play a sound when dragging cards across columns.
              </p>
            </div>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={(e) => setSoundEffects(e.target.checked)}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
          </div>
        </section>

        <button onClick={handleSaveSettings} style={{ width: "100%", padding: "14px" }}>
          Save All System Settings
        </button>
      </div>
    </main>
  );
}

export default Settings;