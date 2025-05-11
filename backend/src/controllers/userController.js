const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest'); // Import FriendRequest model

// @desc    Get all users
// @route   GET /api/users
// @access  Private
exports.getUsers = async (req, res) => {
  try {
    // Get all users except the current user
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friends', 'username petName petAvatar');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { username, password, avatar, petName, petAvatar, bio, toys: petToys } = req.body;
    
    // Find user
    let user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update fields
    if (username) user.username = username;
    if (avatar) user.avatar = avatar;
    if (petName) user.petName = petName;
    if (bio !== undefined) user.bio = bio;
    if (petToys !== undefined) user.petToys = Array.isArray(petToys) ? petToys : []; 
    
    // If password is being updated, it needs to be hashed
    // The UserSchema.pre('save') hook handles hashing if user.password is modified
    if (password) {
      user.password = password; // The pre-save hook will hash this
    }
    
    // Save user
    const updatedUser = await user.save();
    
    // Return user without password
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
      return res.status(400).json({ success: false, message: 'Username already taken.' });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user.id;
    const currentUserFriends = req.user.friends || [];

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    // Find IDs of users with pending friend requests involving the current user
    const pendingRequests = await FriendRequest.find({
      $or: [
        { sender: currentUserId, status: 'pending' },
        { recipient: currentUserId, status: 'pending' }
      ]
    }).select('sender recipient');

    const pendingUserIds = pendingRequests.map(req => 
      req.sender.toString() === currentUserId ? req.recipient : req.sender
    );

    // Combine exclusions: self, friends, pending requests
    const excludedUserIds = [
      currentUserId, 
      ...currentUserFriends.map(id => id.toString()), 
      ...pendingUserIds.map(id => id.toString())
    ];
    
    // Search users by username or petName, excluding specified IDs
    const users = await User.find({
      $and: [
        { _id: { $nin: excludedUserIds } }, // Exclude self, friends, and pending requests
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { petName: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).select('-password -friends -friendRequests -email'); // Select relevant fields, exclude sensitive/unnecessary ones
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
