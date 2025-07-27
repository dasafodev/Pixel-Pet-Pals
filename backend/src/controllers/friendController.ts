import type { Request, Response } from 'express';
import type { Types } from 'mongoose';
import type { IApiResponse, IFriendRequestDocument } from '../types/common';
import User from '../models/User.js';
import FriendRequest from '../models/FriendRequest.js';

interface FriendRequestResponse extends IApiResponse {
  friendRequest?: IFriendRequestDocument;
}

interface FriendRequestListResponse extends IApiResponse {
  count?: number;
  friendRequests?: IFriendRequestDocument[];
}

interface FriendsListResponse extends IApiResponse {
  count?: number;
  friends?: any[];
}

// @desc    Send friend request
// @route   POST /api/friends/request/:id
// @access  Private
export const sendFriendRequest = async (req: Request<{ id: string }>, res: Response<FriendRequestResponse>): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user exists
    const recipient = await User.findById(id);

    if (!recipient) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check if user is trying to add themselves
    if (req.user!.id === id) {
      res.status(400).json({
        success: false,
        message: 'You cannot add yourself as a friend',
      });
      return;
    }

    // Check if friend request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.user!.id, recipient: id },
        { sender: id, recipient: req.user!.id },
      ],
    });

    if (existingRequest) {
      res.status(400).json({
        success: false,
        message: 'Friend request already exists',
      });
      return;
    }

    // Check if they are already friends
    if ((req.user as any).friends.includes(id)) {
      res.status(400).json({
        success: false,
        message: 'You are already friends with this user',
      });
      return;
    }

    // Create friend request
    const friendRequest = await FriendRequest.create({
      sender: req.user!.id,
      recipient: id,
    });

    // Add to recipient's friend requests
    recipient.friendRequests.push(req.user!.id as any);
    await recipient.save();

    res.status(201).json({
      success: true,
      friendRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

// @desc    Accept friend request
// @route   PUT /api/friends/accept/:requestId
// @access  Private
export const acceptFriendRequest = async (req: Request<{ requestId: string }>, res: Response<IApiResponse>): Promise<void> => {
  try {
    const { requestId } = req.params;

    // Find the friend request by its ID and ensure the current user is the recipient
    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      recipient: req.user!.id,
      status: 'pending',
    });

    if (!friendRequest) {
      res.status(404).json({
        success: false,
        message: 'Friend request not found',
      });
      return;
    }

    // Update friend request status
    friendRequest.status = 'accepted';
    await friendRequest.save();

    // Add each user to the other's friends list
    const sender = await User.findById(friendRequest.sender);
    const recipient = await User.findById(req.user!.id);

    // Ensure users exist before modifying
    if (!sender || !recipient) {
      res.status(404).json({ success: false, message: 'Sender or recipient not found' });
      return;
    }

    // Add friends if not already added (idempotency)
    if (!sender.friends.includes(req.user!.id as any)) {
      sender.friends.push(req.user!.id as any);
    }
    if (!recipient.friends.includes(friendRequest.sender as any)) {
      recipient.friends.push(friendRequest.sender as any);
    }

    // Remove sender ID from recipient's friendRequests array
    recipient.friendRequests = recipient.friendRequests.filter(
      requestSenderId => (requestSenderId as Types.ObjectId).toString() !== (friendRequest.sender as Types.ObjectId).toString()
    );

    await sender.save();
    await recipient.save();

    // Socket.IO: Notify both parties to refresh friends list
    if (req.io) {
      req.io.to((sender._id as Types.ObjectId).toString()).emit('friend-accepted');
      req.io.to((recipient._id as Types.ObjectId).toString()).emit('friend-accepted');
    }

    res.status(200).json({
      success: true,
      message: 'Friend request accepted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

// @desc    Reject friend request
// @route   PUT /api/friends/reject/:requestId
// @access  Private
export const rejectFriendRequest = async (req: Request<{ requestId: string }>, res: Response<IApiResponse>): Promise<void> => {
  try {
    const { requestId } = req.params;

    // Find the friend request by its ID and ensure the current user is the recipient
    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      recipient: req.user!.id,
      status: 'pending',
    });

    if (!friendRequest) {
      res.status(404).json({
        success: false,
        message: 'Friend request not found',
      });
      return;
    }

    // Update friend request status
    friendRequest.status = 'rejected';
    await friendRequest.save();

    // Remove sender ID from recipient's friendRequests array
    const recipient = await User.findById(req.user!.id);
    if (recipient) {
      recipient.friendRequests = recipient.friendRequests.filter(
        requestSenderId => (requestSenderId as Types.ObjectId).toString() !== (friendRequest.sender as Types.ObjectId).toString()
      );
      await recipient.save();
    }

    res.status(200).json({
      success: true,
      message: 'Friend request rejected',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

// @desc    Get friend requests
// @route   GET /api/friends/requests
// @access  Private
export const getFriendRequests = async (req: Request, res: Response<FriendRequestListResponse>): Promise<void> => {
  try {
    // Get pending friend requests
    const friendRequests = await FriendRequest.find({
      recipient: req.user!.id,
      status: 'pending',
    }).populate('sender', 'username petName petAvatar');

    res.status(200).json({
      success: true,
      count: friendRequests.length,
      friendRequests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

// @desc    Get friends
// @route   GET /api/friends
// @access  Private
export const getFriends = async (req: Request, res: Response<FriendsListResponse>): Promise<void> => {
  try {
    // Get user with populated friends
    const user = await User.findById(req.user!.id).populate(
      'friends',
      'username avatar petName bio'
    );

    res.status(200).json({
      success: true,
      count: user!.friends.length,
      friends: user!.friends,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

// @desc    Remove friend
// @route   DELETE /api/friends/:id
// @access  Private
export const removeFriend = async (req: Request<{ id: string }>, res: Response<IApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if they are friends
    const user = await User.findById(req.user!.id);

    if (!user!.friends.includes(id as any)) {
      res.status(400).json({
        success: false,
        message: 'You are not friends with this user',
      });
      return;
    }

    // Remove from each other's friends list
    const friend = await User.findById(id);

    user!.friends = user!.friends.filter(friendId => (friendId as Types.ObjectId).toString() !== id);
    friend!.friends = friend!.friends.filter(friendId => (friendId as Types.ObjectId).toString() !== req.user!.id);

    await user!.save();
    await friend!.save();

    // Delete any friend requests
    await FriendRequest.deleteMany({
      $or: [
        { sender: req.user!.id, recipient: id },
        { sender: id, recipient: req.user!.id },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Friend removed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};