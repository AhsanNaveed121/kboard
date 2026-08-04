import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(form);
      if (response.data?.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
      }
      const userData = response.data?.user;
      if (userData) login(userData);
      const redirectTarget = userData?.role === "admin" ? "/admin" : "/boards";
      setSuccess(`Logged in successfully! Redirecting...`);
      setTimeout(() => navigate(redirectTarget), 1200);
    } catch (err) {
      setError("Login failed, check credentials and retry again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <aside className="login-left">
        <div className="login-brand-logo">
          <img src="/logo.svg" alt="Kboard" className="login-logo-img" />
          <div>
            <div className="login-brand-name">Kboard</div>
            <div className="login-brand-tagline">Enterprise Access</div>
          </div>
        </div>

        <div className="login-left-main">
          <h2>Precision workflow management for modern enterprises.</h2>
          <p>
            Centralize your data, automate your processes, and scale with
            confidence.
          </p>
        </div>

        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          © 2026 Kboard Inc. All rights reserved.
        </p>
      </aside>

      <section className="login-right">
        <div className="login-right-inner">
          <h1>Welcome Back</h1>
          <p>Enterprise access</p>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="login-input-wrapper">
              <label htmlFor="email" className="login-label">
                Workspace Email
              </label>
              <input
                id="email"
                className="login-input"
                name="email"
                type="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="login-input-wrapper" style={{ position: "relative" }}>
              <label htmlFor="password" className="login-label">
                Password
              </label>
              <input
                id="password"
                className="login-input"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Log In →"}
            </button>
          </form>

          <div className="login-divider">
            <span>Or authenticate with</span>
          </div>
          <div className="login-social-row">
            {/*
              Clicking this does window.location.href = backend URL.
              This is NOT an API call — it's a full browser redirect.
              React hands control to the browser, which goes to Express,
              which hands control to Passport, which goes to Google.
            */}
            <button
              className="login-social-btn"
              type="button"
              onClick={() => {
                const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
                window.location.href = `${apiBase}/auth/google`;
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="login-footer-text">
            New to the workspace?{" "}
            <Link to="/register">Register Company</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
