const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth'); // Import the protect middleware

// POST /api/ai/chat
router.post('/chat', protect, aiController.handleChat);

module.exports = router;
