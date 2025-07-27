import { UserRepository } from '../repositories/UserRepository.js';
import type {
  IUser,
  IUserCreate,
  IUserUpdate,
  IUserSearchFilters,
  IUserSearchResult,
} from '../types/User.js';
import type { CreateUserDto, UpdateUserDto, SearchUserDto } from '../dto/UserDto.js';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Get all users except the current user
   */
  async getAllUsersExcept(userId: string): Promise<IUser[]> {
    return await this.userRepository.findAllExcept(userId);
  }

  /**
   * Get user by ID with populated friends
   */
  async getUserById(userId: string): Promise<IUser | null> {
    return await this.userRepository.findByIdWithFriends(userId);
  }

  /**
   * Create new user with validation
   */
  async createUser(userData: CreateUserDto): Promise<IUser> {
    // Validate required fields
    if (!userData.username || !userData.email || !userData.password || !userData.petName) {
      throw new Error('Missing required fields');
    }

    // Validate username format
    if (userData.username.length < 3 || userData.username.length > 20) {
      throw new Error('Username must be between 3 and 20 characters');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if username is taken
    const isUsernameTaken = await this.userRepository.isUsernameTaken(userData.username);
    if (isUsernameTaken) {
      throw new Error('Username already taken');
    }

    // Check if email is taken
    const isEmailTaken = await this.userRepository.isEmailTaken(userData.email);
    if (isEmailTaken) {
      throw new Error('Email already registered');
    }

    // Set default values
    const userToCreate: IUserCreate = {
      ...userData,
      avatar: userData.avatar || '/avatars/avatar_1.png',
      petAvatar: userData.petAvatar || '/pets/pet_1.png',
      petToys: userData.petToys || [],
      bio: userData.bio || '',
    };

    return await this.userRepository.create(userToCreate);
  }

  /**
   * Update user profile with validation
   */
  async updateUserProfile(userId: string, updateData: UpdateUserDto): Promise<IUser | null> {
    // Validate user exists
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Validate username if being updated
    if (updateData.username) {
      if (updateData.username.length < 3 || updateData.username.length > 20) {
        throw new Error('Username must be between 3 and 20 characters');
      }

      const isUsernameTaken = await this.userRepository.isUsernameTaken(
        updateData.username,
        userId
      );
      if (isUsernameTaken) {
        throw new Error('Username already taken');
      }
    }

    // Validate password if being updated
    if (updateData.password && updateData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Validate bio length
    if (updateData.bio && updateData.bio.length > 200) {
      throw new Error('Bio must be 200 characters or less');
    }

    // Validate petToys is array
    if (updateData.petToys && !Array.isArray(updateData.petToys)) {
      throw new Error('Pet toys must be an array');
    }

    return await this.userRepository.updateById(userId, updateData);
  }

  /**
   * Search users with advanced filtering
   */
  async searchUsers(
    searchData: SearchUserDto,
    currentUserId: string,
    excludeFriends: boolean = true
  ): Promise<IUserSearchResult[]> {
    if (!searchData.query || searchData.query.trim().length === 0) {
      throw new Error('Search query is required');
    }

    const filters: IUserSearchFilters = {
      query: searchData.query.trim(),
      limit: searchData.limit || 50,
      skip: searchData.skip || 0,
      excludeIds: [currentUserId],
    };

    // If excluding friends, get current user's friends and add to exclude list
    if (excludeFriends) {
      const currentUser = await this.userRepository.findById(currentUserId);
      if (currentUser && currentUser.friends) {
        filters.excludeIds = [
          ...filters.excludeIds!,
          ...currentUser.friends.map(friend => friend.toString()),
        ];
      }
    }

    return await this.userRepository.searchUsers(filters);
  }

  /**
   * Add friend to user
   */
  async addFriend(userId: string, friendId: string): Promise<IUser | null> {
    // Validate both users exist
    const user = await this.userRepository.findById(userId);
    const friend = await this.userRepository.findById(friendId);

    if (!user || !friend) {
      throw new Error('User or friend not found');
    }

    // Check if already friends
    if (user.friends.includes(friendId as any)) {
      throw new Error('Already friends');
    }

    // Add friend to both users
    await this.userRepository.addFriend(userId, friendId);
    await this.userRepository.addFriend(friendId, userId);

    return await this.userRepository.findById(userId);
  }

  /**
   * Remove friend from user
   */
  async removeFriend(userId: string, friendId: string): Promise<IUser | null> {
    // Validate both users exist
    const user = await this.userRepository.findById(userId);
    const friend = await this.userRepository.findById(friendId);

    if (!user || !friend) {
      throw new Error('User or friend not found');
    }

    // Remove friend from both users
    await this.userRepository.removeFriend(userId, friendId);
    await this.userRepository.removeFriend(friendId, userId);

    return await this.userRepository.findById(userId);
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<{ totalUsers: number; userFriends: number }> {
    const totalUsers = await this.userRepository.count();
    const user = await this.userRepository.findById(userId);
    const userFriends = user ? user.friends.length : 0;

    return {
      totalUsers,
      userFriends,
    };
  }

  /**
   * Validate user credentials
   */
  async validateCredentials(email: string, password: string): Promise<IUser | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValidPassword = await user.comparePassword(password);
    return isValidPassword ? user : null;
  }
}
