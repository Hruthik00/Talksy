import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import io from "socket.io-client";

// Use environment variable for socket connection
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
console.log("Socket URL configured as:", SOCKET_URL);

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({}); // userId: boolean
  const [connectionError, setConnectionError] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { authUser } = useAuthStore();

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (!authUser || isConnecting) return;
    
    try {
      setIsConnecting(true);
      console.log("Initializing socket connection to:", SOCKET_URL);
      console.log("With auth user:", authUser._id);
      
      // Create socket with reconnection options
      const newSocket = io(SOCKET_URL, {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 20000,
        transports: ['websocket', 'polling'],
      });

      // Handle connection events
      newSocket.on("connect", () => {
        console.log("Socket connected successfully:", newSocket.id);
        setConnectionError(false);
        setIsConnecting(false);
        
        // Join with userId immediately after connection
        newSocket.emit("join", authUser._id);
        console.log("Emitted join event with userId:", authUser._id);
        
        // Request online users list
        newSocket.emit("getOnlineUsers");
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
        setConnectionError(true);
        setIsConnecting(false);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setIsConnecting(false);
      });

      // Set up event listeners
      newSocket.on("getOnlineUsers", (users) => {
        console.log("Received online users:", users);
        setOnlineUsers(users);
      });

      newSocket.on("typing", (data) => {
        console.log("Typing event received:", data);
        setTypingUsers((prev) => ({ ...prev, [data.senderId]: true }));
      });

      newSocket.on("stopTyping", (data) => {
        console.log("Stop typing event received:", data);
        setTypingUsers((prev) => ({ ...prev, [data.senderId]: false }));
      });

      setSocket(newSocket);

      return () => {
        console.log("Cleaning up socket connection");
        newSocket.disconnect();
      };
    } catch (error) {
      console.error("Socket initialization error:", error);
      setConnectionError(true);
      setIsConnecting(false);
    }
  }, [authUser, isConnecting]);

  // Initialize or clean up socket based on auth state
  useEffect(() => {
    if (authUser) {
      const cleanup = initializeSocket();
      return cleanup;
    } else if (socket) {
      // Disconnect socket when user logs out
      console.log("User logged out, disconnecting socket");
      socket.disconnect();
      setSocket(null);
      setOnlineUsers([]);
      setTypingUsers({});
    }
  }, [authUser, initializeSocket, socket]);

  // Function to emit typing event
  const sendTypingStatus = useCallback((receiverId, isTyping) => {
    if (socket && authUser) {
      const data = {
        senderId: authUser._id,
        receiverId,
      };
      
      console.log(`Emitting ${isTyping ? "typing" : "stopTyping"} event:`, data);
      socket.emit(isTyping ? "typing" : "stopTyping", data);
    }
  }, [socket, authUser]);

  // Function to join a group chat
  const joinGroup = useCallback((groupId) => {
    if (socket) {
      console.log("Joining group:", groupId);
      socket.emit("joinGroup", groupId);
    }
  }, [socket]);

  const value = {
    socket,
    onlineUsers,
    typingUsers,
    connectionError,
    sendTypingStatus,
    joinGroup,
    isConnecting,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 