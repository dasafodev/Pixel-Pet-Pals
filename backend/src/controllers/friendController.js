const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

// @desc    Send friend request
// @route   POST /api/friends/request/:id
// @access  Private
exports.sendFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const recipient = await User.findById(id);
    
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is trying to add themselves
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot add yourself as a friend'
      });
    }
    
    // Check if friend request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.user.id, recipient: id },
        { sender: id, recipient: req.user.id }
      ]
    });
    
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Friend request already exists'
      });
    }
    
    // Check if they are already friends
    if (req.user.friends.includes(id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already friends with this user'
      });
    }
    
    // Create friend request
    const friendRequest = await FriendRequest.create({
      sender: req.user.id,
      recipient: id
    });
    
    // Add to recipient's friend requests
    recipient.friendRequests.push(req.user.id);
    await recipient.save();
    
    res.status(201).json({
      success: true,
      friendRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Accept friend request
// @route   PUT /api/friends/accept/:id
// @access  Private
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params; // Use requestId from route parameter
    
    // Find the friend request by its ID and ensure the current user is the recipient
    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      recipient: req.user.id,
      status: 'pending'
    });
    
    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }
    
    // Update friend request status
    friendRequest.status = 'accepted';
    await friendRequest.save();
    
    // Add each user to the other's friends list
    const sender = await User.findById(friendRequest.sender); // Get sender from the request document
    const recipient = await User.findById(req.user.id);
    
    // Ensure users exist before modifying
    if (!sender || !recipient) {
      return res.status(404).json({ success: false, message: 'Sender or recipient not found' });
    }

    // Add friends if not already added (idempotency)
    if (!sender.friends.includes(req.user.id)) {
      sender.friends.push(req.user.id);
    }
    if (!recipient.friends.includes(friendRequest.sender)) {
      recipient.friends.push(friendRequest.sender);
    }
    
    // Remove sender ID from recipient's friendRequests array (if present)
    // Note: The FriendRequest document itself is marked 'accepted', 
    // but some implementations might store pending sender IDs directly on the User model.
    // This line assumes recipient.friendRequests stores sender IDs. Adjust if needed.
    recipient.friendRequests = recipient.friendRequests.filter(
      requestSenderId => requestSenderId.toString() !== friendRequest.sender.toString()
    );
    
    await sender.save();
    await recipient.save();

    // Socket.IO: 通知双方刷新好友列表
    if (req.io) {
      req.io.to(sender._id.toString()).emit('friend-accepted');
      req.io.to(recipient._id.toString()).emit('friend-accepted');
    }

    res.status(200).json({
      success: true,
      message: 'Friend request accepted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reject friend request
// @route   PUT /api/friends/reject/:id
// @access  Private
exports.rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params; // Use requestId from route parameter
    
    // Find the friend request by its ID and ensure the current user is the recipient
    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      recipient: req.user.id,
      status: 'pending'
    });
    
    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }
    
    // Update friend request status
    friendRequest.status = 'rejected';
    await friendRequest.save();
    
    // Remove sender ID from recipient's friendRequests array (if present)
    const recipient = await User.findById(req.user.id);
    if (recipient) {
        recipient.friendRequests = recipient.friendRequests.filter(
          requestSenderId => requestSenderId.toString() !== friendRequest.sender.toString()
        );
        await recipient.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Friend request rejected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get friend requests
// @route   GET /api/friends/requests
// @access  Private
exports.getFriendRequests = async (req, res) => {
  try {
    // Get pending friend requests
    const friendRequests = await FriendRequest.find({
      recipient: req.user.id,
      status: 'pending'
    }).populate('sender', 'username petName petAvatar');
    
    res.status(200).json({
      success: true,
      count: friendRequests.length,
      friendRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get friends
// @route   GET /api/friends
// @access  Private
exports.getFriends = async (req, res) => {
  try {
    // Get user with populated friends
    const user = await User.findById(req.user.id)
      .populate('friends', 'username petName petAvatar bio');
    
    res.status(200).json({
      success: true,
      count: user.friends.length,
      friends: user.friends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Remove friend
// @route   DELETE /api/friends/:id
// @access  Private
exports.removeFriend = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if they are friends
    const user = await User.findById(req.user.id);
    
    if (!user.friends.includes(id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not friends with this user'
      });
    }
    
    // Remove from each other's friends list
    const friend = await User.findById(id);
    
    user.friends = user.friends.filter(
      friendId => friendId.toString() !== id
    );
    
    friend.friends = friend.friends.filter(
      friendId => friendId.toString() !== req.user.id
    );
    
    await user.save();
    await friend.save();
    
    // Delete any friend requests
    await FriendRequest.deleteMany({
      $or: [
        { sender: req.user.id, recipient: id },
        { sender: id, recipient: req.user.id }
      ]
    });
    
    res.status(200).json({
      success: true,
      message: 'Friend removed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
