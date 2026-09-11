import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL || "https://foundmet-backend.onrender.com";

let socketInstance = null;

/**
 * Get or initialize the singleton Socket.IO instance
 */
export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: false,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      timeout: 10000,
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      console.log("[Socket] Connected to FoundMet real-time server:", socketInstance.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
    });
  }

  return socketInstance;
};

/**
 * Connect socket and register current founder
 */
export const connectSocket = () => {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const registerPresence = (userId) => {
  const socket = connectSocket();
  const register = () => socket.emit("register_presence", { userId: String(userId) });
  if (socket.connected) register();
  else socket.once("connect", register);
  return socket;
};

/**
 * Disconnect socket cleanly on logout
 */
export const disconnectSocket = () => {
  if (socketInstance && socketInstance.connected) {
    socketInstance.disconnect();
  }
};
