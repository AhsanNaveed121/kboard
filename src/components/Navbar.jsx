import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <img src="/logo.svg" alt="Kboard" className="navbar-logo-img" />
        </Link>
      </div>

      {/* Nav Links */}
      <ul className="nav-links">
        <li>
          <Link
            to="/"
            className={isActive("/") ? "active" : ""}
          >
            Dashboard
          </Link>
        </li>
        {user?.role === "admin" ? (
          <li>
            <Link
              to="/admin"
              className={isActive("/admin") ? "active" : ""}
              style={{ color: "var(--cyan)" }}
            >
              Admin
            </Link>
          </li>
        ) : (
          <li>
            <Link
              to="/boards"
              className={isActive("/boards") ? "active" : ""}
            >
              Boards
            </Link>
          </li>
        )}
        {user && (
          <li>
            <Link
              to="/profile"
              className={isActive("/profile") ? "active" : ""}
            >
              Profile
            </Link>
          </li>
        )}
      </ul>

      {/* Right-side auth area */}
      <div className="auth-links">
        {user ? (
          <>
            {/* Notification icon */}
            <button className="nav-icon-btn" title="Notifications" aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>

            {/* Settings icon → navigates to /settings */}
            <button
              className={`nav-icon-btn${isActive("/settings") ? " active" : ""}`}
              title="Settings"
              aria-label="Settings"
              onClick={() => navigate("/settings")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            {/* Create Task CTA */}
            <Link to="/boards">
              <button className="navbar-create-btn">+ Create</button>
            </Link>

            {/* Avatar / Profile */}
            <Link to="/profile" title={user.fullName}>
              {user.profilePicTag ? (
                <img
                  src={user.profilePicTag}
                  alt="Profile"
                  className="nav-avatar"
                />
              ) : (
                <div className="nav-avatar-placeholder">
                  {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                </div>
              )}
            </Link>

            {/* Logout */}
            <button
              onClick={logout}
              className="btn-secondary"
              style={{ padding: "6px 14px", fontSize: "0.78rem" }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-secondary" style={{ padding: "7px 16px", fontSize: "0.82rem" }}>
              Login
            </Link>
            <Link to="/register">
              <button className="navbar-create-btn">Register</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;