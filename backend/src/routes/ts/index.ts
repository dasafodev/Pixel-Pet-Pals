import { Router } from 'express';
import { UserRoutes } from './UserRoutes.js';

export class Routes {
  private readonly router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // User routes
    const userRoutes = new UserRoutes();
    this.router.use('/users', userRoutes.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}
