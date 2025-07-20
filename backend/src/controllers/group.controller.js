import Group from "../models/group.model.js";
import GroupMessage from "../models/groupMessage.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../index.js";

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, description, members, groupImage } = req.body;
    const admin = req.user._id;
    
    // Ensure admin is included in members
    const allMembers = [...members, admin];
    
    // Upload group image if provided
    let imageUrl = "";
    if (groupImage) {
      const uploadResponse = await cloudinary.uploader.upload(groupImage);
      imageUrl = uploadResponse.secure_url;
    }
    
    const newGroup = new Group({
      name,
      description,
      admin,
      members: allMembers,
      groupImage: imageUrl,
    });
    
    await newGroup.save();
    
    // Populate members info
    const populatedGroup = await Group.findById(newGroup._id)
      .populate("members", "-password")
      .populate("admin", "-password");
    
    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("Error in createGroup controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all groups for a user
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const groups = await Group.find({ members: userId })
      .populate("members", "-password")
      .populate("admin", "-password")
      .sort({ updatedAt: -1 });
    
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getUserGroups controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a specific group by ID
export const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    
    const group = await Group.findById(groupId)
      .populate("members", "-password")
      .populate("admin", "-password");
    
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Check if user is a member of the group
    if (!group.members.some(member => member._id.toString() === userId.toString())) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }
    
    res.status(200).json(group);
  } catch (error) {
    console.error("Error in getGroupById controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update group details
export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, groupImage } = req.body;
    const userId = req.user._id;
    
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Check if user is admin
    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only admin can update group details" });
    }
    
    // Update fields
    if (name) group.name = name;
    if (description) group.description = description;
    
    // Upload new group image if provided
    if (groupImage) {
      const uploadResponse = await cloudinary.uploader.upload(groupImage);
      group.groupImage = uploadResponse.secure_url;
    }
    
    await group.save();
    
    // Populate members info
    const updatedGroup = await Group.findById(groupId)
      .populate("members", "-password")
      .populate("admin", "-password");
    
    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in updateGroup controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add members to a group
export const addGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { members } = req.body; // Array of user IDs
    const userId = req.user._id;
    
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Check if user is admin
    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only admin can add members" });
    }
    
    // Add new members
    for (const memberId of members) {
      if (!group.members.includes(memberId)) {
        group.members.push(memberId);
      }
    }
    
    await group.save();
    
    // Populate members info
    const updatedGroup = await Group.findById(groupId)
      .populate("members", "-password")
      .populate("admin", "-password");
    
    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in addGroupMembers controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Remove a member from a group
export const removeGroupMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user._id;
    
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Check if user is admin or removing themselves
    if (group.admin.toString() !== userId.toString() && userId.toString() !== memberId) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    // Cannot remove admin
    if (memberId === group.admin.toString()) {
      return res.status(400).json({ error: "Cannot remove admin from group" });
    }
    
    // Remove member
    group.members = group.members.filter(member => member.toString() !== memberId);
    
    await group.save();
    
    // Populate members info
    const updatedGroup = await Group.findById(groupId)
      .populate("members", "-password")
      .populate("admin", "-password");
    
    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in removeGroupMember controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a group
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Check if user is admin
    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only admin can delete group" });
    }
    
    // Delete all group messages
    await GroupMessage.deleteMany({ groupId });
    
    // Delete group
    await Group.findByIdAndDelete(groupId);
    
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error in deleteGroup controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a message to a group
export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, image } = req.body;
    const senderId = req.user._id;
    
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Check if user is a member of the group
    if (!group.members.some(member => member.toString() === senderId.toString())) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }
    
    // Upload image if provided
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    
    const newMessage = new GroupMessage({
      groupId,
      senderId,
      text,
      image: imageUrl,
    });
    
    await newMessage.save();
    
    // Populate sender info
    const populatedMessage = await GroupMessage.findById(newMessage._id).populate("senderId", "-password");
    
    // Emit message to all group members via socket.io
    io.to(groupId).emit("newGroupMessage", populatedMessage);
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendGroupMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all messages for a group
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Check if user is a member of the group
    if (!group.members.some(member => member.toString() === userId.toString())) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }
    
    const messages = await GroupMessage.find({ groupId })
      .populate("senderId", "-password")
      .sort({ createdAt: 1 });
    
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getGroupMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}; 