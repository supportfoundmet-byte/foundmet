import axios from "axios";

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

export default api;