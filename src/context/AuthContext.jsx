import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, logout as logoutApi } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user from secure HTTPOnly cookie on initial page load / refresh
  useEffect(() => {
    // Purge legacy/old localStorage auth items if present
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        if (response?.data) {
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Global listener for 401 Unauthorized responses across all API calls
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.warn("Backend logout failed:", err);
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  };

  const updateUser = (updatedUserData) => {
    setUser((prevUser) => {
      return { ...prevUser, ...updatedUserData };
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
