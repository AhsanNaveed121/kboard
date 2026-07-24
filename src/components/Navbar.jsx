import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Kboard</Link>
      </div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        {user?.role === "admin" ? (
          <li><Link to="/admin" style={{ color: "#38bdf8", fontWeight: "bold" }}>Admin Dashboard</Link></li>
        ) : (
          <li><Link to="/boards">Boards</Link></li>
        )}
        {user && <li><Link to="/profile">Profile</Link></li>}
        <li><Link to="/settings">Settings</Link></li>
      </ul>

      <div className="auth-links">
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              to="/profile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                color: "white",
              }}
            >
              {user.profilePicTag ? (
                <img
                  src={user.profilePicTag}
                  alt="Profile"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: user.role === "admin" ? "2px solid #38bdf8" : "1.5px solid #2563eb",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: user.role === "admin" ? "#0284c7" : "#2563eb",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                </div>
              )}
              <span style={{ fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                {user.fullName}
                {user.role === "admin" && (
                  <span style={{ background: "#0284c7", color: "white", fontSize: "10px", padding: "2px 6px", borderRadius: "10px", fontWeight: "bold" }}>
                    ADMIN
                  </span>
                )}
              </span>
            </Link>

            <button
              onClick={logout}
              style={{
                background: "transparent",
                border: "1px solid #ef4444",
                color: "#ef4444",
                padding: "6px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "13px",
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
