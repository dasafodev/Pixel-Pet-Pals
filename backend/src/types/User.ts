import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  avatar: string;
  email: string;
  password: string;
  petName: string;
  petAvatar: string;
  petToys: string[];
  bio: string;
  friends: Types.ObjectId[];
  friendRequests: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserCreate {
  username: string;
  email: string;
  password: string;
  petName: string;
  avatar?: string;
  petAvatar?: string;
  petToys?: string[];
  bio?: string;
}

export interface IUserUpdate {
  username?: string;
  avatar?: string;
  petName?: string;
  petAvatar?: string;
  petToys?: string[];
  bio?: string;
  password?: string;
}

export interface IUserResponse {
  _id: string;
  username: string;
  avatar: string;
  email: string;
  petName: string;
  petAvatar: string;
  petToys: string[];
  bio: string;
  friends: IUserResponse[];
  friendRequests: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserSearchResult {
  _id: string;
  username: string;
  avatar: string;
  petName: string;
  petAvatar: string;
  bio: string;
}

export interface IUserSearchFilters {
  query: string;
  excludeIds?: string[];
  limit?: number;
  skip?: number;
} 