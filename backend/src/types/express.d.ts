import { IUser } from './User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {}; 