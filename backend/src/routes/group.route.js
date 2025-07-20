import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getUserGroups,
  getGroupById,
  updateGroup,
  addGroupMembers,
  removeGroupMember,
  deleteGroup,
  sendGroupMessage,
  getGroupMessages,
} from "../controllers/group.controller.js";

const router = express.Router();

// Protect all routes
router.use(protectRoute);

// Group routes
router.post("/", createGroup);
router.get("/", getUserGroups);
router.get("/:groupId", getGroupById);
router.put("/:groupId", updateGroup);
router.post("/:groupId/members", addGroupMembers);
router.delete("/:groupId/members/:memberId", removeGroupMember);
router.delete("/:groupId", deleteGroup);

// Group message routes
router.post("/:groupId/messages", sendGroupMessage);
router.get("/:groupId/messages", getGroupMessages);

export default router; 