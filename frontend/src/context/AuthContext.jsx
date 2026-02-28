// ============================================================
// context/AuthContext.jsx
// Provides: user, isAuthenticated, isLoading, login, logout
//
// Access token is stored in-memory (closure in axiosInstance),
// NEVER in localStorage. On mount, attempts a silent refresh to
// restore the session from the httpOnly cookie.
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { clearAccessToken, setAccessToken } from "../api/axiosInstance";
import { getMe, loginUser, logoutUser, refreshToken } from "../api/authApi";
import { parseError } from "../utils/errorParser";

// ── Context ──────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true during initial session restore

  // ── Restore session on app mount ──────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await refreshToken();
        setAccessToken(data.accessToken);
        const meRes = await getMe();
        setUser(meRes.data.user);
      } catch {
        // No valid session — continue as guest
        clearAccessToken();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── Listen for global auth:logout event (fired by interceptor) ──
  useEffect(() => {
    const handleLogout = () => {
      clearAccessToken();
      setUser(null);
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  // ── login ─────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await loginUser({ email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  // ── logout ────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Fire-and-forget — clear client state regardless
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────
export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuthContext must be used within <AuthProvider>");
  return ctx;
};

export { parseError };
