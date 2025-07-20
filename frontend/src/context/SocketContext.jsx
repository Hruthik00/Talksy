import { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import io from "socket.io-client";

// Use a fixed URL for socket connection
const SOCKET_URL = 'http://localhost:3000';
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
  const { authUser } = useAuthStore();

  useEffect(() => {
    if (authUser) {
      try {
        // Create socket with reconnection options
        console.log("Connecting to socket at:", SOCKET_URL);
        console.log("With auth user:", authUser._id);
        
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
          
          // Join with userId immediately after connection
          newSocket.emit("join", authUser._id);
          console.log("Emitted join event with userId:", authUser._id);
        });

        newSocket.on("connect_error", (err) => {
          console.error("Socket connection error:", err.message);
          setConnectionError(true);
        });

        newSocket.on("disconnect", (reason) => {
          console.log("Socket disconnected:", reason);
        });

        setSocket(newSocket);

        // Clean up on unmount
        return () => {
          console.log("Cleaning up socket connection");
          newSocket.disconnect();
        };
      } catch (error) {
        console.error("Socket initialization error:", error);
        setConnectionError(true);
      }
    } else if (socket) {
      // Disconnect socket when user logs out
      console.log("User logged out, disconnecting socket");
      socket.disconnect();
      setSocket(null);
    }
  }, [authUser]);

  useEffect(() => {
    if (socket === null || !authUser) return;

    // Listen for online users
    socket.on("getOnlineUsers", (users) => {
      console.log("Received online users:", users);
      setOnlineUsers(users);
    });

    // Listen for typing indicators
    socket.on("typing", (data) => {
      setTypingUsers((prev) => ({ ...prev, [data.senderId]: true }));
    });

    socket.on("stopTyping", (data) => {
      setTypingUsers((prev) => ({ ...prev, [data.senderId]: false }));
    });

    return () => {
      socket.off("getOnlineUsers");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket, authUser]);

  // Function to emit typing event
  const sendTypingStatus = (receiverId, isTyping) => {
    if (socket && authUser) {
      const data = {
        senderId: authUser._id,
        receiverId,
      };
      
      socket.emit(isTyping ? "typing" : "stopTyping", data);
    }
  };

  // Function to join a group chat
  const joinGroup = (groupId) => {
    if (socket) {
      console.log("Joining group:", groupId);
      socket.emit("joinGroup", groupId);
    }
  };

  const value = {
    socket,
    onlineUsers,
    typingUsers,
    connectionError,
    sendTypingStatus,
    joinGroup,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 