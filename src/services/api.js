import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://foundmet-backend-aoi6.onrender.com/";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response && error.request) {
      error.userMessage = "Could not reach FoundMet. Check your connection and try again.";
    }
    return Promise.reject(error);
  },
);

export default api;
