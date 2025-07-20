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
      const res = await axiosInstance.get("/auth/check");
      if (res && res.data) {
        console.log("Auth check successful:", res.data);
        set({ authUser: res.data });
      } else {
        set({ authUser: null });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  
  signup: async (userData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", userData);
      
      if (res && res.data) {
        set({ authUser: res.data });
        toast.success("Signup successful!");
        return { success: true };
      }
      return { success: false, error: "Invalid response from server" };
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = error.response?.data?.error || "Signup failed";
      return { success: false, error: errorMessage };
    } finally {
      set({ isSigningUp: false });
    }
  },
  
  login: async (userData) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", userData);
      
      if (res && res.data) {
        set({ authUser: res.data });
        toast.success("Login successful!");
        return { success: true };
      }
      return { success: false, error: "Invalid response from server" };
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.error || "Login failed";
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoggingIn: false });
    }
  },
  
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      
      // Disconnect socket
      const { disconnectSocket } = get();
      disconnectSocket();
      
      set({ authUser: null });
      toast.success("Logged out successfully");
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  },
  
  updateProfile: async (userData) => {
    set({ isUpdatingProfile: true });
    try {
      // Use the correct endpoint as defined in the backend routes
      const res = await axiosInstance.put("/auth/update-profile", userData);
      
      if (res && res.data) {
        set({ authUser: res.data });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update profile error:", error);
      const errorMessage = error.response?.data?.error || "Profile update failed";
      toast.error(errorMessage);
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  
  searchUsers: async (query) => {
    try {
      const res = await axiosInstance.get(`/auth/search?query=${query}`);
      return res.data || [];
    } catch (error) {
      console.error("Search users error:", error);
      return [];
    }
  }
}));