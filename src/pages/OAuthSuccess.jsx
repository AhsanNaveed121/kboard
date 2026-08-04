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

      if (token) {
        // Fallback: If token was provided in URL parameter
        try {
          localStorage.setItem("accessToken", token);
          const payloadBase64 = token.split(".")[1];
          const userData = JSON.parse(atob(payloadBase64));

          login({
            _id: userData._id,
            email: userData.email,
            fullName: userData.fullName,
            role: userData.role,
          });

          navigate("/boards", { replace: true });
          return;
        } catch (err) {
          console.error("Failed to decode URL OAuth token:", err);
        }
      }

      // Secure default: Fetch authenticated profile via HTTP-Only cookie set during OAuth redirect
      try {
        const userRes = await getCurrentUser();
        if (userRes?.data) {
          login(userRes.data);
          navigate("/boards", { replace: true });
          return;
        }
      } catch (err) {
        console.error("OAuth cookie verification failed:", err);
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

