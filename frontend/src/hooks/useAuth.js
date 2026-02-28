// ============================================================
// hooks/useAuth.js
// Convenience wrapper around AuthContext.
// ============================================================

import { useAuthContext } from "../context/AuthContext";

/**
 * Returns { user, isAuthenticated, isLoading, login, logout }
 */
export const useAuth = () => useAuthContext();
