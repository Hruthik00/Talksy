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
      const res = await axiosInstance.get("/auth/check");
      if (res && res.data) {
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
      const res = await axiosInstance.post("/auth/signup", data);
      console.log("Signup response:", res); // for debugging
      
      if (res && res.data) {
        set({ authUser: res.data });
        toast.success("Account created successfully");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Signup error:", error);
      
      // Handle different types of errors
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to sign up. Please try again.");
      }
    } finally {
      set({ isSigningUp: false });
    }
  },
  
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      if (res && res.data) {
        set({ authUser: res.data });
        toast.success("Logged in successfully");
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
      }
    } catch (error) {
      console.log("Error in update profile:", error);
      
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
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