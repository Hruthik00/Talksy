
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
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
  }
});

// Socket.io connection handling
const userSocketMap = {}; // userId -> socketId
const groupSocketMap = {}; // groupId -> [socketIds]

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);
  
  // User joins with their userId
  socket.on('join', (userId) => {
    userSocketMap[userId] = socket.id;
    console.log('User joined:', userId);
  });

  // Join group chat
  socket.on('joinGroup', (groupId) => {
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
    io.to(data.groupId).emit('newGroupMessage', data);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const receiverSocketId = userSocketMap[data.receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing', data);
    }
  });

  // Handle stop typing indicators
  socket.on('stopTyping', (data) => {
    const receiverSocketId = userSocketMap[data.receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('stopTyping', data);
    }
  });

  socket.on('disconnect', () => {
    // Remove user from userSocketMap
    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
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
    
    console.log('A user disconnected');
  });
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], // Allow multiple frontend URLs
  credentials: true, // Allow cookies to be sent with requests
}));

//app.options('*', cors({ origin: 'http://localhost:5173', credentials: true }));
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);


const PORT = process.env.PORT||3000;
console.log("Using PORT:", PORT);

server.listen(PORT, () => {
  console.log("Server is running on PORT:" + PORT);
  connectDB();
});

// Make io available to other modules
export { io };