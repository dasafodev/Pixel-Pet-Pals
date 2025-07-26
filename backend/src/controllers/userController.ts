import type { Request, Response } from 'express';
import type { Types } from 'mongoose';
import type { IApiResponse, IUserDocument } from '@/types/common.js';
import User from '../models/User.js';
import FriendRequest from '../models/FriendRequest.js';

interface UpdateProfileRequest {
  username?: string;
  password?: string;
  avatar?: string;
  petName?: string;
  petAvatar?: string;
  bio?: string;
  toys?: string[];
}

interface SearchQuery {
  query?: string;
}

interface UserListResponse extends IApiResponse {
  count?: number;
  users?: IUserDocument[];
}

interface UserResponse extends IApiResponse {
  user?: IUserDocument;
}

// @desc    Get all users
// @route   GET /api/users
// @access  Private
export const getUsers = async (req: Request, res: Response<UserListResponse>): Promise<void> => {
  try {
    // Get all users except the current user
    const users = await User.find({ _id: { $ne: req.user!.id } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req: Request<{ id: string }>, res: Response<UserResponse>): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friends', 'username petName petAvatar');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req: Request<{}, UserResponse, UpdateProfileRequest>, res: Response<UserResponse>): Promise<void> => {
  try {
    const { username, password, avatar, petName, petAvatar, bio, toys: petToys } = req.body;

    // Find user
    let user = await User.findById(req.user!.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
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
    delete (userResponse as any).password;

    res.status(200).json({
      success: true,
      user: userResponse as IUserDocument,
    });
  } catch (error: any) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
      res.status(400).json({ success: false, message: 'Username already taken.' });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
export const searchUsers = async (req: Request<{}, UserListResponse, {}, SearchQuery>, res: Response<UserListResponse>): Promise<void> => {
  try {
    const { query } = req.query;
    const currentUserId = req.user!.id;
    const currentUserFriends = (req.user as any).friends || [];

    if (!query) {
      res.status(400).json({
        success: false,
        message: 'Please provide a search query',
      });
      return;
    }

    // Find IDs of users with pending friend requests involving the current user
    const pendingRequests = await FriendRequest.find({
      $or: [
        { sender: currentUserId, status: 'pending' },
        { recipient: currentUserId, status: 'pending' },
      ],
    }).select('sender recipient');

    const pendingUserIds = pendingRequests.map(req =>
      (req.sender as Types.ObjectId).toString() === currentUserId ? req.recipient : req.sender
    );

    // Combine exclusions: self, friends, pending requests
    const excludedUserIds = [
      currentUserId,
      ...currentUserFriends.map((id: Types.ObjectId) => id.toString()),
      ...pendingUserIds.map((id: Types.ObjectId) => id.toString()),
    ];

    // Search users by username or petName, excluding specified IDs
    const users = await User.find({
      $and: [
        { _id: { $nin: excludedUserIds } }, // Exclude self, friends, and pending requests
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { petName: { $regex: query, $options: 'i' } },
          ],
        },
      ],
    }).select('-password -friends -friendRequests -email'); // Select relevant fields, exclude sensitive/unnecessary ones

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};