import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
} from "../controllers/chatController.js";

const router = Router();

router.use(requireAuth);

router.post("/send", sendMessage);
router.get("/conversations", getConversations);
router.get("/conversation/:conversationWith", getConversation);
router.put("/mark-as-read/:senderId", markAsRead);

export default router;
