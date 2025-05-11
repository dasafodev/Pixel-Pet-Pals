const express = require('express');
const { 
  getUsers, 
  getUserById, 
  updateProfile, 
  searchUsers 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

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

module.exports = router;
