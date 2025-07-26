import express from 'express';
import * as aiController from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/ai/chat
router.post('/chat', protect, aiController.handleChat);

export default router;