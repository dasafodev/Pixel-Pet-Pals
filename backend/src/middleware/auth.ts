import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import type { IJWTPayload } from '../types/common';
import type { Types } from 'mongoose';
import User from '../models/User.js';

// Middleware to verify JWT token
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IJWTPayload;

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Add user to request object
    req.user = {
      id: (user._id as Types.ObjectId).toString(),
      username: user.username,
      email: user.email,
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Middleware to generate JWT token
export const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
};