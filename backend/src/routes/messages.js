const express = require('express');
const { 
  sendMessage,
  getMessages,
  getUnreadCount,
  getConversations,
  deleteMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

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

module.exports = router;
