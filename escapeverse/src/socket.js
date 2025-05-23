import { io } from "socket.io-client";

export const socket = io("http://localhost:3001");

socket.on("connect", () => {
  console.log("Connected to server with ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});