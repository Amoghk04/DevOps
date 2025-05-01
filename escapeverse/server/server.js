import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Change this to your frontend port if different
    methods: ["GET", "POST"]
  }
});

// Store both players and host information for each room
const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, username, isCreator }) => {
    console.log(`User ${socket.id} (${username}) joining room ${roomId}. Is creator: ${isCreator}`);
    
    const player = {
      id: socket.id,
      username: username || `Player-${Math.floor(Math.random() * 1000)}`,
      isCreator: isCreator
    };

    // Initialize room if it doesn't exist
    if (!rooms[roomId]) {
      console.log(`Creating new room ${roomId} with host ${socket.id}`);
      rooms[roomId] = {
        players: [],
        hostId: isCreator ? socket.id : null,
        theme: "theme" // Default theme
      };
    }

    // Set this user as host if they are the creator or if there's no host yet
    if (isCreator || !rooms[roomId].hostId) {
      console.log(`Setting ${socket.id} as host for room ${roomId}`);
      rooms[roomId].hostId = socket.id;
    }

    // Add player to room's player list
    rooms[roomId].players.push(player);

    // Join the socket room
    socket.join(roomId);
    
    // Store roomId on the socket for easy access on disconnect
    socket.roomId = roomId;
    
    // Emit updated room info to all players in the room
    io.to(roomId).emit("room-players", {
      players: rooms[roomId].players || [],
      hostId: rooms[roomId].hostId
    });
    
    // Inform the socket directly if they are the host
    socket.emit("host-status", socket.id === rooms[roomId].hostId);
  });

  socket.on("start-game", ({ roomId, theme }) => {
    console.log(`Attempt to start game in room ${roomId} by socket ${socket.id}`);
    console.log(`Room host is: ${rooms[roomId]?.hostId}`);
    
    // Only allow the host to start the game
    if (rooms[roomId] && rooms[roomId].hostId === socket.id) {
      console.log(`Game started in room ${roomId} by host ${socket.id} with theme ${theme}`);
      
      // Store the theme with the room
      if (theme) {
        rooms[roomId].theme = theme;
      }
      
      // Broadcast start-game with theme information to all clients in the room
      io.to(roomId).emit("start-game", { theme: theme || rooms[roomId].theme });
    } else {
      console.log(`Non-host ${socket.id} attempted to start game in room ${roomId}`);
    }
  });

  socket.on("leave-room", (roomId) => {
    handlePlayerLeave(socket, roomId);
  });

  socket.on("disconnect", () => {
    // Handle disconnection for all rooms this socket was in
    if (socket.roomId) {
      handlePlayerLeave(socket, socket.roomId);
    }
  });
});

// Helper function to handle player leaving logic
function handlePlayerLeave(socket, roomId) {
  if (!rooms[roomId]) return;
  
  // Remove player from the room
  rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);
  
  // If the host left, assign a new host if there are players remaining
  if (rooms[roomId].hostId === socket.id && rooms[roomId].players.length > 0) {
    rooms[roomId].hostId = rooms[roomId].players[0].id;
    console.log(`New host assigned: ${rooms[roomId].hostId}`);
    
    // Inform the new host
    io.to(rooms[roomId].hostId).emit("host-status", true);
  }
  
  // If room is empty, clean it up
  if (rooms[roomId].players.length === 0) {
    delete rooms[roomId];
    return;
  }
  
  // Notify remaining players about the update
  io.to(roomId).emit("room-players", {
    players: rooms[roomId].players || [],
    hostId: rooms[roomId].hostId
  });
}

server.listen(3001, () => {
  console.log("Socket.IO server running on port 3001");
});