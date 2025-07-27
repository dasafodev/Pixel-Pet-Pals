export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  petName: string;
  avatar?: string;
  petAvatar?: string;
  petToys?: string[];
  bio?: string;
}

export interface UpdateUserDto {
  username?: string;
  avatar?: string;
  petName?: string;
  petAvatar?: string;
  petToys?: string[];
  bio?: string;
  password?: string;
}

export interface SearchUserDto {
  query: string;
  limit?: number;
  skip?: number;
}

export interface UserResponseDto {
  _id: string;
  username: string;
  avatar: string;
  email: string;
  petName: string;
  petAvatar: string;
  petToys: string[];
  bio: string;
  friends: UserResponseDto[];
  friendRequests: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSearchResultDto {
  _id: string;
  username: string;
  avatar: string;
  petName: string;
  petAvatar: string;
  bio: string;
}

export interface UsersListResponseDto {
  success: boolean;
  count: number;
  users: UserResponseDto[];
}

export interface UserDetailResponseDto {
  success: boolean;
  user: UserResponseDto;
}

export interface UserSearchResponseDto {
  success: boolean;
  count: number;
  users: UserSearchResultDto[];
} 