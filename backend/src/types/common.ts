// Common types for Pixel Pet Pals

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

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  count: number;
  page: number;
  limit: number;
  totalPages: number;
} 