import express from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriends,
  removeFriend,
} from '../controllers/friendController.js';
import { protect } from '../middleware/auth.js';

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

export default router;