import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  socket: null,
  
  setSocket: (socket) => {
    set({ socket });
  },
  
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
  
  checkAuth: async () => {
    try {
      console.log("Checking authentication status...");
      // Use the correct API endpoint without /api prefix
      const res = await axiosInstance.get("/auth/check");
      if (res && res.data) {
        console.log("Auth check successful:", res.data);
        set({ authUser: res.data });
      }
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      console.log("Attempting signup with data:", data);
      
      // Make sure we're using the correct endpoint
      const res = await axiosInstance.post("/auth/signup", data);
      
      if (res && res.data) {
        console.log("Signup successful:", res.data);
        set({ authUser: res.data });
        toast.success("Account created successfully");
        return true;
      } else {
        console.error("Invalid response structure:", res);
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Signup error details:", error);
      
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        
        if (error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error(`Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        toast.error("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Request setup error:", error.message);
        toast.error(error.message || "Failed to sign up. Please try again.");
      }
      
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },
  
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      console.log("Attempting login with:", data.email);
      const res = await axiosInstance.post("/auth/login", data);
      if (res && res.data) {
        console.log("Login successful:", res.data);
        set({ authUser: res.data });
        toast.success("Logged in successfully");
        return true;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to log in. Please try again.");
      }
      
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },
  
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      console.error("Logout error:", error);
      
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to log out. Please try again.");
      }
    }
  },
  
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      if (res && res.data) {
        set({ authUser: res.data });
        toast.success("Profile updated successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.log("Error in update profile:", error);
      
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  
  searchUsers: async (query) => {
    try {
      const res = await axiosInstance.get(`/auth/search?query=${query}`);
      return res.data;
    } catch (error) {
      console.log("Error in searchUsers:", error);
      toast.error("Failed to search users");
      return [];
    }
  },
}));