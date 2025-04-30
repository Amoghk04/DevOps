import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Change this to your frontend port if different
    methods: ["GET", "POST"]
  }
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, username }) => {
    const player = {
      id: socket.id,
      username: username || `Player-${Math.floor(Math.random() * 1000)}`,
    };

    // add player to room's player list
    rooms[roomId] = rooms[roomId] || [];
    rooms[roomId].push(player);

    // Join the socket room
    socket.join(roomId);
    
    // First, immediately emit back to the sender so they see themselves
    socket.emit("room-players", rooms[roomId]);
    
    // Then emit to everyone else in the room
    socket.to(roomId).emit("room-players", rooms[roomId]);
  });

  socket.on("start-game", ({ roomId }) => {
    io.to(roomId).emit("start-game");
  });

  socket.on("leave-room", (roomId) => {
    if (rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter((p) => p.id !== socket.id);
      socket.leave(roomId);
      io.to(roomId).emit("room-players", rooms[roomId]);
    }
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      if (rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter((p) => p.id !== socket.id);
        io.to(roomId).emit("room-players", rooms[roomId]);
      }
    }
  });
});

server.listen(3001, () => {
  console.log("Socket.IO server running on port 3001");
});