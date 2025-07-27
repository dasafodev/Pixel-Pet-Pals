import { Router } from 'express';
import { UserController } from '../../controllers/ts/UserController';

export class UserRoutes {
  private router: Router;
  private userController: UserController;

  constructor() {
    this.router = Router();
    this.userController = new UserController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Get all users
    this.router.get('/', this.userController.getUsers.bind(this.userController));

    // Search users
    this.router.get('/search', this.userController.searchUsers.bind(this.userController));

    // Get user statistics
    this.router.get('/stats', this.userController.getUserStats.bind(this.userController));

    // Update user profile
    this.router.put('/profile', this.userController.updateProfile.bind(this.userController));

    // Add friend
    this.router.post('/friends/:friendId', this.userController.addFriend.bind(this.userController));

    // Remove friend
    this.router.delete('/friends/:friendId', this.userController.removeFriend.bind(this.userController));

    // Get user by ID (must be last to avoid conflicts with other routes)
    this.router.get('/:id', this.userController.getUserById.bind(this.userController));
  }

  public getRouter(): Router {
    return this.router;
  }
} 