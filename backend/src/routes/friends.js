const express = require('express');
const { 
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriends,
  removeFriend
} = require('../controllers/friendController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all friends
router.get('/', getFriends);

// Get friend requests
router.get('/requests', getFriendRequests);

// Send friend request
router.post('/request/:id', sendFriendRequest);

// Accept friend request
router.put('/accept/:requestId', acceptFriendRequest);

// Reject friend request
router.put('/reject/:requestId', rejectFriendRequest);

// Remove friend
router.delete('/:id', removeFriend);

module.exports = router;
