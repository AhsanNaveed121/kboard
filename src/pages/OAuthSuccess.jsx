import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCurrentUser } from "../services/authService";

function OAuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState("Processing your login…");

  useEffect(() => {
    const handleOAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      let loggedInUser = null;

      // First try fetching the complete profile via the newly set cookie
      try {
        const userRes = await getCurrentUser();
        if (userRes?.data) {
          loggedInUser = userRes.data;
        }
      } catch (err) {
        console.warn("Could not fetch user profile via cookie, checking token fallback:", err);
      }

      // Fallback: If cookie fetch failed or token provided in URL
      if (!loggedInUser && token) {
        try {
          const payloadBase64 = token.split(".")[1];
          const userData = JSON.parse(atob(payloadBase64));
          loggedInUser = {
            _id: userData._id,
            email: userData.email,
            fullName: userData.fullName,
            role: userData.role,
            providerId: userData.providerId,
          };
        } catch (err) {
          console.error("Failed to decode URL OAuth token:", err);
        }
      }

      if (loggedInUser) {
        login(loggedInUser);
        const target = loggedInUser.role === "admin" ? "/admin" : "/boards";
        navigate(target, { replace: true });
        return;
      }

      setStatus("Login failed. Could not verify session.");
      setTimeout(() => navigate("/login?error=oauth_failed"), 2000);
    };

    handleOAuth();
  }, []);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "1rem",
        background: "var(--bg-primary, #0f1117)",
        color: "var(--text-primary, #fff)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid rgba(255,255,255,0.1)",
          borderTop: "3px solid #4f8ef7",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: "var(--text-muted, #8b949e)", fontSize: "0.9rem" }}>
        {status}
      </p>
    </main>
  );
}

export default OAuthSuccess;

