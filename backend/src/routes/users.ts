import express from 'express';
import {
  getUsers,
  getUserById,
  updateProfile,
  searchUsers,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all users
router.get('/', getUsers);

// Search users
router.get('/search', searchUsers);

// Update user profile
router.put('/profile', updateProfile);

// Get user by ID
router.get('/:id', getUserById);

export default router;