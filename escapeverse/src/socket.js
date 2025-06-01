import { io } from "socket.io-client";
import config from './config';

const socketURL = `${config.apiUrl}:${config.serverPort}`;

export const socket = io(socketURL, {
  reconnectionDelayMax: 10000,
  reconnectionAttempts: 5
});

socket.on("connect", () => {
  console.log("Connected to server with ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});