import express from "express";
import http from "http";
import { Server } from "socket.io";


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});


// Game state management
const rooms = {};

// Mock questions for the tech quiz (Gates themed)
const techQuestions = [
  "In what year did Bill Gates found Microsoft?",
  "Which programming language did Bill Gates help develop in the 1970s?",
  "What was the name of Bill Gates' first company before Microsoft?",
  "In what year did Bill Gates step down as CEO of Microsoft?",
  "Which famous project did Bill Gates and his wife establish for philanthropy?"
];

// Initialize a room or reset it
function initializeRoom(roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      players: {},
      currentQuestion: getRandomQuestion(),
      answers: {}
    };
  }
}

// Get a random question
function getRandomQuestion() {
  const randomIndex = Math.floor(Math.random() * techQuestions.length);
  return techQuestions[randomIndex];
}

// Socket connection handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle joining a game room
  socket.on("join-game", ({ roomId, username }) => {
    console.log(`${username} joined room ${roomId}`);
    
    // Join the socket room
    socket.join(roomId);
    
    // Initialize room if needed
    initializeRoom(roomId);
    
    // Add player to room
    rooms[roomId].players[socket.id] = username;
    
    // Send current question to the new player
    socket.emit("update-question", rooms[roomId].currentQuestion);
    
    // Send current answers to the new player
    socket.emit("player-answered", rooms[roomId].answers);
    
    // Notify others that a new player joined
    socket.to(roomId).emit("player-joined", username);
  });

  // Handle player answer submission
  socket.on("submit-answer", ({ roomId, username, answer }) => {
    console.log(`${username} answered in room ${roomId}: ${answer}`);
    
    if (rooms[roomId]) {
      // Store the answer
      rooms[roomId].answers[username] = answer;
      
      // Broadcast updated answers to all players in the room
      io.to(roomId).emit("player-answered", rooms[roomId].answers);
    }
  });

  // Admin function to change the question (could be triggered by a timer or admin action)
  socket.on("change-question", ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].currentQuestion = getRandomQuestion();
      rooms[roomId].answers = {}; // Reset answers for new question
      
      // Broadcast new question to all players in the room
      io.to(roomId).emit("update-question", rooms[roomId].currentQuestion);
    }
  });

  // Clean up when user disconnects
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Find which room the user was in
    for (const roomId in rooms) {
      if (rooms[roomId].players[socket.id]) {
        const username = rooms[roomId].players[socket.id];
        
        // Remove player from room
        delete rooms[roomId].players[socket.id];
        
        // If they had answered, remove their answer
        if (rooms[roomId].answers[username]) {
          delete rooms[roomId].answers[username];
          io.to(roomId).emit("player-answered", rooms[roomId].answers);
        }
        
        // Notify others that player left
        socket.to(roomId).emit("player-left", username);
        
        // If room is empty, clean it up
        if (Object.keys(rooms[roomId].players).length === 0) {
          delete rooms[roomId];
        }
        
        break;
      }
    }
  });
});

// Simple ping route to check if server is running
app.get("/", (req, res) => {
  res.send("Tech Arena Game Server is running!");
});

// Start the server
const PORT = 3002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
