import express from 'express';
import {
  sendMessage,
  getMessages,
  getUnreadCount,
  getConversations,
  deleteMessage,
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get conversations
router.get('/conversations', getConversations);

// Get unread message count
router.get('/unread/count', getUnreadCount);

// Send message to user
router.post('/:id', sendMessage);

// Get messages with user
router.get('/:id', getMessages);

// Delete message
router.delete('/:id', deleteMessage);

export default router;