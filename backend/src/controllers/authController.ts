import type { Request, Response } from 'express';
import type { Types } from 'mongoose';
import type { IAuthResponse, IApiResponse } from '../types/common';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  petName: string;
  petAvatar?: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request<{}, IAuthResponse, RegisterRequest>, res: Response<IAuthResponse>): Promise<void> => {
  try {
    const { username, email, password, petName, petAvatar } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      res.status(400).json({
        success: false,
        message: 'User already exists',
      });
      return;
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      petName,
      avatar: petAvatar || '/avatars/avatar_1.png', // Save chosen avatar to main avatar field
      petAvatar: petAvatar || '/avatars/avatar_1.png', // Also set petAvatar to the same
    });

    // Generate token
    const token = generateToken((user._id as Types.ObjectId).toString());

    res.status(201).json({
      success: true,
      token,
      user: {
        id: (user._id as Types.ObjectId).toString(),
        username: user.username,
        email: user.email,
        petName: user.petName,
        avatar: user.avatar, // Return the main avatar
        petAvatar: user.petAvatar, // Keep returning petAvatar for now
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request<{}, IAuthResponse, LoginRequest>, res: Response<IAuthResponse>): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Generate token
    const token = generateToken((user._id as Types.ObjectId).toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        id: (user._id as Types.ObjectId).toString(),
        username: user.username,
        email: user.email,
        petName: user.petName,
        avatar: user.avatar, // Return the main avatar
        petAvatar: user.petAvatar, // Keep returning petAvatar
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select('-password');

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
