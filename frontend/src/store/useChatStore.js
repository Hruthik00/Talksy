import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useChatStore = create((set, get) => ({
  selectedChat: null,
  isGroup: false,
  chats: [],
  messages: [],
  isLoadingChats: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  
  // Set selected chat
  setSelectedChat: (chat, isGroup = false) => {
    set({ selectedChat: chat, isGroup });
  },
  
  // Get all users for sidebar
  getChats: async () => {
    set({ isLoadingChats: true });
    try {
      console.log("Fetching chats...");
      const res = await axiosInstance.get("/messages/users");
      console.log("Chats response:", res.data);
      set({ chats: res.data });
    } catch (error) {
      console.error("Error in getChats:", error);
      // Only show toast for non-401 errors
      if (error.response && error.response.status !== 401) {
        toast.error("Failed to load chats");
      }
    } finally {
      set({ isLoadingChats: false });
    }
  },
  
  // Get all messages for a chat
  getMessages: async (userId) => {
    if (!userId) return;
    
    set({ isLoadingMessages: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      console.error("Error in getMessages:", error);
      // Only show toast for non-401 errors
      if (error.response && error.response.status !== 401) {
        toast.error("Failed to load messages");
      }
    } finally {
      set({ isLoadingMessages: false });
    }
  },
  
  // Send a message
  sendMessage: async (receiverId, text, image = null) => {
    set({ isSendingMessage: true });
    try {
      const res = await axiosInstance.post(`/messages/${receiverId}`, { text, image });
      set((state) => ({ 
        messages: [...state.messages, res.data] 
      }));
      return res.data;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      toast.error("Failed to send message");
      return null;
    } finally {
      set({ isSendingMessage: false });
    }
  },
  
  // Add a new message to the messages array (for socket.io)
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }));
  },
  
  // Group chat functions
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isLoadingGroups: false,
  isLoadingGroupMessages: false,
  
  // Get all groups
  getGroups: async () => {
    set({ isLoadingGroups: true });
    try {
      console.log("Fetching groups...");
      const res = await axiosInstance.get("/groups");
      console.log("Groups response:", res.data);
      set({ groups: res.data });
    } catch (error) {
      console.error("Error in getGroups:", error);
      // Only show toast for non-401 errors
      if (error.response && error.response.status !== 401) {
        toast.error("Failed to load groups");
      }
    } finally {
      set({ isLoadingGroups: false });
    }
  },
  
  // Set selected group
  setSelectedGroup: (group) => {
    set({ selectedGroup: group, selectedChat: null });
  },
  
  // Get all messages for a group
  getGroupMessages: async (groupId) => {
    if (!groupId) return;
    
    set({ isLoadingGroupMessages: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ groupMessages: res.data });
    } catch (error) {
      console.error("Error in getGroupMessages:", error);
      // Only show toast for non-401 errors
      if (error.response && error.response.status !== 401) {
        toast.error("Failed to load group messages");
      }
    } finally {
      set({ isLoadingGroupMessages: false });
    }
  },
  
  // Send a message to a group
  sendGroupMessage: async (groupId, text, image = null) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/messages`, { text, image });
      set((state) => ({ 
        groupMessages: [...state.groupMessages, res.data] 
      }));
      return res.data;
    } catch (error) {
      console.error("Error in sendGroupMessage:", error);
      toast.error("Failed to send message");
      return null;
    }
  },
  
  // Add a new message to the group messages array (for socket.io)
  addGroupMessage: (message) => {
    set((state) => ({
      groupMessages: [...state.groupMessages, message]
    }));
  },
  
  // Create a new group
  createGroup: async (data) => {
    try {
      const res = await axiosInstance.post("/groups", data);
      set((state) => ({ 
        groups: [...state.groups, res.data] 
      }));
      toast.success("Group created successfully");
      return res.data;
    } catch (error) {
      console.error("Error in createGroup:", error);
      toast.error("Failed to create group");
      return null;
    }
  },
})); 