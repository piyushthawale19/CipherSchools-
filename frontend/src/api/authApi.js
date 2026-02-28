// ============================================================
// api/authApi.js
// Auth-related API calls.
// ============================================================

import axiosInstance from "./axiosInstance";

/**
 * Register a new user.
 * @param {{ displayName: string, email: string, password: string }} data
 */
export const registerUser = (data) =>
  axiosInstance.post("/api/auth/register", data);

/**
 * Login — sets httpOnly refresh token cookie, returns access token.
 * @param {{ email: string, password: string }} data
 */
export const loginUser = (data) => axiosInstance.post("/api/auth/login", data);

/**
 * Silent refresh — uses the httpOnly cookie to get a new access token.
 * Called automatically by the Axios interceptor; can also be called
 * on page load to restore session.
 */
export const refreshToken = () => axiosInstance.post("/api/auth/refresh");

/**
 * Logout — clears the refresh token from DB and deletes the cookie.
 */
export const logoutUser = () => axiosInstance.post("/api/auth/logout");

/**
 * Get the currently authenticated user's profile.
 */
export const getMe = () => axiosInstance.get("/api/auth/me");
