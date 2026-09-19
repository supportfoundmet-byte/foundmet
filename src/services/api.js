import axios from "axios";
import { disconnectSocket } from "./socket.js";

const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "https://foundmet-backend-aoi6.onrender.com";

export const API_BASE_URL = configuredApiBaseUrl.replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const isAdminRequest = config.url?.startsWith("/admin");

  const token =
    sessionStorage.getItem(
      isAdminRequest ? "foundmet_admin_token" : "foundmet_access_token"
    ) ||
    localStorage.getItem(
      isAdminRequest ? "foundmet_admin_token" : "foundmet_access_token"
    );

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (!error.response && error.request) {
      error.userMessage =
        "Could not reach FoundMet. Check your connection and try again.";
    } else if (status === 429) {
      error.userMessage =
        "Too many attempts. Please wait a moment and try again.";
    } else if (status >= 500) {
      error.userMessage =
        "Something went wrong. Please try again.";
    } else if (error.response?.data?.message) {
      error.userMessage = error.response.data.message;
    }

    return Promise.reject(error);
  }
);

/**
 * Deep purge of all client authentication state, cached profile,
 * connection status, tokens, drafts, and active sockets.
 */
export function purgeClientAuthState() {
  // Remove all user and auth items from localStorage
  const keysToRemove = [
    "foundmet_user",
    "foundmet_access_token",
    "foundmet_admin_token",
    "foundmet_connections",
    "foundmet_shared_phones",
    "foundmet_user_ideas",
    "foundmet_reg_data",
    "foundmet_chat_history",
  ];

  keysToRemove.forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  });

  // Clear sessionStorage completely
  try {
    sessionStorage.clear();
  } catch {
    /* ignore */
  }

  // Disconnect any active Socket.IO connection
  try {
    disconnectSocket();
  } catch {
    /* ignore */
  }

  // Clear Axios common Authorization header
  if (api.defaults?.headers?.common) {
    delete api.defaults.headers.common["Authorization"];
  }
}

export default api;