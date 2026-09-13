import { io } from "socket.io-client";
import { API_BASE_URL } from "./api.js";

let socketInstance = null;

/**
 * Get (or lazily create) the singleton Socket.IO instance.
 * Passes the Bearer token in socket handshake auth so the server
 * can authenticate the connection even without a cookie.
 */
export const getSocket = () => {
  if (!socketInstance) {
    const token =
      sessionStorage.getItem("foundmet_access_token") ||
      localStorage.getItem("foundmet_access_token") ||
      "";

    socketInstance = io(API_BASE_URL, {
      autoConnect: false,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      timeout: 10000,
      // Try WebSocket first, fall back to polling (matches server config)
      transports: ["websocket", "polling"],
      withCredentials: true,
      // Send token so the server can auth without cookies (e.g. CORS environments)
      auth: { token },
    });

    socketInstance.on("connect", () => {
      console.log("[Socket] Connected:", socketInstance.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
    });

    socketInstance.on("disconnect", (reason) => {
      console.warn("[Socket] Disconnected:", reason);
    });
  }

  return socketInstance;
};

/**
 * Connect the socket (and optionally refresh the auth token before connecting).
 */
export const connectSocket = () => {
  const socket = getSocket();

  // Refresh auth token in case it changed since last getSocket() call
  const token =
    sessionStorage.getItem("foundmet_access_token") ||
    localStorage.getItem("foundmet_access_token") ||
    "";
  if (token && socket.auth) {
    socket.auth.token = token;
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

/**
 * Register the current user's presence.
 * Emits register_presence once connected (or immediately if already connected).
 */
export const registerPresence = (userId) => {
  const socket = connectSocket();
  const register = () =>
    socket.emit("register_presence", { userId: String(userId) });
  if (socket.connected) register();
  else socket.once("connect", register);
  return socket;
};

/**
 * Disconnect cleanly on logout.
 * Also destroys the singleton so the next login gets a fresh socket with fresh token.
 */
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null; // Force re-creation on next login
  }
};
