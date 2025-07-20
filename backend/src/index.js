
import express from 'express';
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import groupRoutes from "./routes/group.route.js";
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import cors from 'cors';
import { connectDB } from './lib/db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

// Get environment variables with defaults
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Allow multiple frontend URLs in development
const allowedOrigins = NODE_ENV === 'production' 
  ? [FRONTEND_URL, 'https://chatty-app-frontend.onrender.com', 'https://talksy-frontend.onrender.com'] 
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];

console.log(`Server running in ${NODE_ENV} mode`);
console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  }
});

// Socket.io connection handling
const userSocketMap = {}; // userId -> socketId
const onlineUsers = new Set(); // Set of online user IDs
const groupSocketMap = {}; // groupId -> [socketIds]

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);
  
  // User joins with their userId
  socket.on('join', (userId) => {
    if (!userId) return;
    
    userSocketMap[userId] = socket.id;
    onlineUsers.add(userId);
    console.log('User joined:', userId);
    console.log('Online users:', Array.from(onlineUsers));
    
    // Broadcast updated online users list to all connected clients
    io.emit('getOnlineUsers', Array.from(onlineUsers));
  });

  // Client requests online users list
  socket.on('getOnlineUsers', () => {
    console.log('Sending online users:', Array.from(onlineUsers));
    socket.emit('getOnlineUsers', Array.from(onlineUsers));
  });

  // Join group chat
  socket.on('joinGroup', (groupId) => {
    if (!groupId) return;
    
    socket.join(groupId);
    if (!groupSocketMap[groupId]) {
      groupSocketMap[groupId] = [];
    }
    groupSocketMap[groupId].push(socket.id);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  // Handle private messages
  socket.on('privateMessage', (data) => {
    const receiverSocketId = userSocketMap[data.receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', data);
    }
  });

  // Handle group messages
  socket.on('groupMessage', (data) => {
    if (!data || !data.groupId) return;
    io.to(data.groupId).emit('newGroupMessage', data);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    if (!data || !data.receiverId) return;
    
    const receiverSocketId = userSocketMap[data.receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing', data);
    }
  });

  // Handle stop typing indicators
  socket.on('stopTyping', (data) => {
    if (!data || !data.receiverId) return;
    
    const receiverSocketId = userSocketMap[data.receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('stopTyping', data);
    }
  });

  socket.on('disconnect', () => {
    // Remove user from userSocketMap and onlineUsers
    let disconnectedUserId = null;
    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        disconnectedUserId = userId;
        delete userSocketMap[userId];
        onlineUsers.delete(userId);
        break;
      }
    }
    
    // Remove user from group chats
    for (const groupId in groupSocketMap) {
      groupSocketMap[groupId] = groupSocketMap[groupId].filter(id => id !== socket.id);
      if (groupSocketMap[groupId].length === 0) {
        delete groupSocketMap[groupId];
      }
    }
    
    console.log('A user disconnected:', disconnectedUserId);
    console.log('Online users after disconnect:', Array.from(onlineUsers));
    
    // Broadcast updated online users list
    if (disconnectedUserId) {
      io.emit('getOnlineUsers', Array.from(onlineUsers));
    }
  });
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cookieParser());
app.use(cors({
  origin: allowedOrigins,
  credentials: true, // Allow cookies to be sent with requests
}));

app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);
app.use("/groups", groupRoutes);

console.log("Using PORT:", PORT);

server.listen(PORT, () => {
  console.log("Server is running on PORT:" + PORT);
  connectDB();
});

// Make io available to other modules
export { io };