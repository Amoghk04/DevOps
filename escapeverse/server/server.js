import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import codeVerificationRouter from './routes/codeVerification.js';

dotenv.config({ path: './.env' })

const app = express();
const server = http.createServer(app);
const port = 3001;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

// Add code verification routes
app.use('/api/code', codeVerificationRouter);

const password = "7kyL0ZIOBr6Fx6TC";
if (!password) {
  console.error('MongoDB password not found in environment variables');
  process.exit(1);
}

// MongoDB Connection
mongoose.connect(`mongodb+srv://devops:${password}@cluster0.w5ivypc.mongodb.net/escapeverse?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: String,
  password: String, // Consider hashing passwords in production
  displayName: String,
  createdAt: Date,
  profileIndex: Number,
});

// User Model
const User = mongoose.model('User', userSchema);

// Create User Endpoint
app.post('/api/create-user', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).send({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send({ message: 'Failed to create user', error: error.message });
  }
});

// Add this endpoint after your other routes
app.post('/api/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    res.json({ exists: !!existingUser });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add this new endpoint after your existing routes
app.post('/api/get-user', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.json({ 
        exists: false,
        message: 'User not found' 
      });
    }

    res.json({
      exists: true,
      username: user.displayName,
      profileIndex: user.profileIndex,
      message: 'User found'
    });

  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
});

app.post('/api/update-username', async (req, res) => {
  try {
    const { email, newUsername } = req.body;
    
    if (!email || !newUsername) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and new username are required' 
      });
    }

    console.log(`Attempting to update username for email: ${email} to ${newUsername}`);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    user.displayName = newUsername;
    await user.save();

    console.log(`Username updated successfully for email: ${email}`);
    res.json({ 
      success: true, 
      message: 'Username updated successfully' 
    });
    
  } catch (error) {
    console.error('Error updating username:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

app.post('/api/update-profile', async (req, res) => {
    try {
        const { email, newUsername, newProfileIndex } = req.body;
        
        if (!email || !newUsername) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and new username are required' 
            });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        user.displayName = newUsername;
        user.profileIndex = newProfileIndex;
        await user.save();

        res.json({ 
            success: true, 
            message: 'Profile updated successfully' 
        });
        
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
});

app.post('/api/delete-account', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required' 
            });
        }

        const result = await User.deleteOne({ email });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Account deleted successfully' 
        });
        
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

export { io };

// Store both players and host information for each room
const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user-login", async ({ uid, email, password, displayName, profileIndex }) => {
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ uid });
      console.log(`Outside -- Profile index ${profileIndex} for user ${uid}`);
      
      if (!existingUser) {
        // Create a new user document
        const newUser = new User({
          uid,
          email,
          displayName: displayName || "New User",
          password: password || "", 
          createdAt: new Date(),
          profileIndex,
        });
        console.log(`${password}--password`);

        await newUser.save();
        console.log(`New user saved to MongoDB: ${uid}`);
      } else {
        console.log(`User already exists in MongoDB: ${uid}`);
      }
    } catch (error) {
      console.error("Error saving user to MongoDB:", error);
    }
  });

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

server.listen(port, () => {
  console.log(`Socket.IO server running on port ${port}`);
});
