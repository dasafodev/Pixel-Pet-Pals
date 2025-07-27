import type { Request, Response } from 'express';
import { UserService } from '../../services/UserService.js';
import type { UpdateUserDto, SearchUserDto } from '../../dto/UserDto.js';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * @desc    Get all users except current user
   * @route   GET /api/users
   * @access  Private
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = (req as any).user.id;
      const users = await this.userService.getAllUsersExcept(currentUserId);

      res.status(200).json({
        success: true,
        count: users.length,
        users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * @desc    Get user by ID
   * @route   GET /api/users/:id
   * @access  Private
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id!;
      const user = await this.userService.getUserById(userId);

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
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * @desc    Update user profile
   * @route   PUT /api/users/profile
   * @access  Private
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = (req as any).user.id;
      const updateData: UpdateUserDto = req.body;

      const updatedUser = await this.userService.updateUserProfile(currentUserId, updateData);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Return user without password
      const userResponse = updatedUser.toObject();
      delete userResponse.password;

      res.status(200).json({
        success: true,
        user: userResponse,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Username already taken')) {
          res.status(400).json({
            success: false,
            message: error.message,
          });
          return;
        }
        if (error.message.includes('User not found')) {
          res.status(404).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * @desc    Search users
   * @route   GET /api/users/search
   * @access  Private
   */
  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = (req as any).user.id;
      const searchData: SearchUserDto = {
        query: req.query.query as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        skip: req.query.skip ? parseInt(req.query.skip as string) : undefined,
      };

      if (!searchData.query) {
        res.status(400).json({
          success: false,
          message: 'Please provide a search query',
        });
        return;
      }

      const users = await this.userService.searchUsers(searchData, currentUserId);

      res.status(200).json({
        success: true,
        count: users.length,
        users,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Search query is required')) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * @desc    Add friend
   * @route   POST /api/users/friends/:friendId
   * @access  Private
   */
  async addFriend(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = (req as any).user.id;
      const friendId = req.params.friendId!;

      if (!currentUserId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!friendId) {
        res.status(400).json({
          success: false,
          message: 'Friend ID is required'
        });
        return;
      }

      const updatedUser = await this.userService.addFriend(currentUserId, friendId);

      res.status(200).json({
        success: true,
        message: 'Friend added successfully',
        user: updatedUser,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('User or friend not found')) {
          res.status(404).json({
            success: false,
            message: error.message,
          });
          return;
        }
        if (error.message.includes('Already friends')) {
          res.status(400).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * @desc    Remove friend
   * @route   DELETE /api/users/friends/:friendId
   * @access  Private
   */
  async removeFriend(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = (req as any).user.id;
      const friendId = req.params.friendId!;

      if (!currentUserId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!friendId) {
        res.status(400).json({
          success: false,
          message: 'Friend ID is required'
        });
        return;
      }

      const updatedUser = await this.userService.removeFriend(currentUserId, friendId);

      res.status(200).json({
        success: true,
        message: 'Friend removed successfully',
        user: updatedUser,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('User or friend not found')) {
          res.status(404).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * @desc    Get user statistics
   * @route   GET /api/users/stats
   * @access  Private
   */
  async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = (req as any).user.id;
      const stats = await this.userService.getUserStats(currentUserId);

      res.status(200).json({
        success: true,
        stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
