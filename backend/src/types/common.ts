// Core type definitions for Pixel Pet Pals Backend

import type { Document, Types } from 'mongoose';

// User Types
export interface IUser {
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
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserDocument extends IUser, IUserMethods, Document {}

// Message Types
export interface IMessage {
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageDocument extends IMessage, Document {}

// Post Types
export interface IComment {
  user: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface ICommentDocument extends IComment, Document {}

// For subdocument comments in Post arrays
export interface ICommentSubdoc extends IComment {
  _id?: Types.ObjectId;
}

export interface IPost {
  user: Types.ObjectId;
  content: string;
  imageUrls: string[];
  likes: Types.ObjectId[];
  comments: ICommentSubdoc[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostDocument extends IPost, Document {}

// Friend Request Types
export interface IFriendRequest {
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface IFriendRequestDocument extends IFriendRequest, Document {}

// Event Types
export interface IEvent {
  creator: Types.ObjectId;
  title: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  locationName: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isPredefined: boolean;
  participants: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventDocument extends IEvent, Document {}

// JWT Payload Types
export interface IJWTPayload {
  id: string;
  iat?: number;
  exp?: number;
}

// API Response Types
export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Alias para compatibilidad con tu rama users
export type ApiResponse<T = any> = IApiResponse<T>;

// Paginación (puedes usar este tipo para ambos casos)
export interface PaginatedResponse<T> extends IApiResponse<T[]> {
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User Response Types
export interface IUserResponse {
  id: string;
  username: string;
  email: string;
  petName: string;
  avatar: string;
  petAvatar: string;
  bio?: string;
}

// Auth Response
export interface IAuthResponse extends IApiResponse {
  token?: string;
  user?: IUserResponse;
}

// Error Handling Types
export interface IApiError {
  success: false;
  message: string;
  error?: string;
  stack?: string;
}

export interface IValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface IApiValidationError extends IApiError {
  errors: IValidationError[];
}

// Authenticated User (un solo tipo, extendido si lo necesitas)
export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  petName?: string;
  petAvatar?: string;
  bio?: string;
  friends?: string[];
  friendRequests?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}