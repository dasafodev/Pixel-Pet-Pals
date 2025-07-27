import { Types } from 'mongoose';
import User from '../models/User';
import { IUser, IUserSearchFilters, IUserSearchResult } from '../types/User';

export class UserRepository {
  /**
   * Find all users except the specified user
   */
  async findAllExcept(userId: string): Promise<IUser[]> {
    return (await User.find({ _id: { $ne: userId } })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean()) as unknown as IUser[];
  }

  /**
   * Find user by ID with populated friends
   */
  async findByIdWithFriends(userId: string): Promise<IUser | null> {
    return (await User.findById(userId)
      .select('-password')
      .populate('friends', 'username petName petAvatar')
      .lean()) as unknown as IUser | null;
  }

  /**
   * Find user by ID without password
   */
  async findById(userId: string): Promise<IUser | null> {
    return (await User.findById(userId).select('-password').lean()) as unknown as IUser | null;
  }

  /**
   * Find user by ID with password (for authentication)
   */
  async findByIdWithPassword(userId: string): Promise<IUser | null> {
    return await User.findById(userId);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username });
  }

  /**
   * Search users by username or petName
   */
  async searchUsers(filters: IUserSearchFilters): Promise<IUserSearchResult[]> {
    const { query, excludeIds = [], limit = 50, skip = 0 } = filters;

    const searchQuery = {
      $and: [
        { _id: { $nin: excludeIds } },
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { petName: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    };

    return (await User.find(searchQuery)
      .select('-password -friends -friendRequests -email')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .lean()) as unknown as IUserSearchResult[];
  }

  /**
   * Create new user
   */
  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return (await user.save()) as unknown as IUser;
  }

  /**
   * Update user by ID
   */
  async updateById(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete user by ID
   */
  async deleteById(userId: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(userId);
    return result !== null;
  }

  /**
   * Add friend to user
   */
  async addFriend(userId: string, friendId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { friends: friendId } },
      { new: true }
    );
  }

  /**
   * Remove friend from user
   */
  async removeFriend(userId: string, friendId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { friends: friendId } },
      { new: true }
    );
  }

  /**
   * Add friend request
   */
  async addFriendRequest(userId: string, requestId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { friendRequests: requestId } },
      { new: true }
    );
  }

  /**
   * Remove friend request
   */
  async removeFriendRequest(userId: string, requestId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { friendRequests: requestId } },
      { new: true }
    );
  }

  /**
   * Get users count
   */
  async count(): Promise<number> {
    return await User.countDocuments();
  }

  /**
   * Check if username exists
   */
  async isUsernameTaken(username: string, excludeUserId?: string): Promise<boolean> {
    const query: any = { username };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    const user = await User.findOne(query);
    return user !== null;
  }

  /**
   * Check if email exists
   */
  async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    const query: any = { email };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    const user = await User.findOne(query);
    return user !== null;
  }
} 