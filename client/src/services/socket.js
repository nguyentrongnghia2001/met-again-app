import { io } from "socket.io-client";

const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export const createSocket = () =>
  io(serverUrl, {
    autoConnect: false,
    transports: ["websocket"],
    reconnection: true,
  });
