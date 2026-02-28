// ============================================================
// api/axiosInstance.js
// Central Axios instance with JWT silent-refresh interceptor.
// Access token is stored in memory (closure), NOT localStorage.
// On 401, automatically calls /auth/refresh and retries once.
// ============================================================

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── In-memory access token store ────────────────────────────
// Never persisted to localStorage — prevents XSS token theft.
let _accessToken = null;

export const setAccessToken = (token) => {
  _accessToken = token;
};
export const getAccessToken = () => _accessToken;
export const clearAccessToken = () => {
  _accessToken = null;
};

// ── Axios instance ───────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send httpOnly refresh-token cookie
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach Bearer token ─────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    if (_accessToken) {
      config.headers["Authorization"] = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: silent refresh on 401 ─────────────
let _isRefreshing = false;
let _failedQueue = []; // Queued requests while refresh is in flight

const processQueue = (error, token = null) => {
  _failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  _failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401 errors on non-refresh routes.
    // _retry flag prevents infinite refresh loops.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      if (_isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          _failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        const { data } = await axiosInstance.post("/api/auth/refresh");
        const newToken = data.accessToken;
        setAccessToken(newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        // Redirect to login — dispatch a custom event so AuthContext can respond
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
