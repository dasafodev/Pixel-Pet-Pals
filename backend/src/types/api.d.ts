// API Response Type Patterns

export interface BaseApiResponse {
  success: boolean;
  message?: string;
}

export interface ApiErrorResponse extends BaseApiResponse {
  success: false;
  message: string;
  error?: string;
}

export interface ApiSuccessResponse<T = any> extends BaseApiResponse {
  success: true;
  data?: T;
}

// Auth API Responses
export interface LoginResponse extends ApiSuccessResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    petName: string;
    avatar: string;
    petAvatar: string;
  };
}

export interface RegisterResponse extends LoginResponse {}

// User API Responses
export interface UsersListResponse extends ApiSuccessResponse {
  count: number;
  users: Array<{
    _id: string;
    username: string;
    avatar: string;
    petName: string;
    petAvatar: string;
    bio: string;
  }>;
}

// Friends API Responses
export interface FriendsListResponse extends ApiSuccessResponse {
  count: number;
  friends: Array<{
    _id: string;
    username: string;
    avatar: string;
    petName: string;
    petAvatar: string;
    bio: string;
  }>;
}

// Posts API Responses
export interface PostsListResponse extends ApiSuccessResponse {
  posts: Array<{
    _id: string;
    user: {
      _id: string;
      username: string;
      avatar: string;
      petAvatar: string;
    };
    content: string;
    imageUrls: string[];
    likes: string[];
    comments: Array<{
      _id: string;
      user: {
        _id: string;
        username: string;
        avatar: string;
        petAvatar: string;
      };
      text: string;
      createdAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }>;
  totalPages: number;
  currentPage: number;
  totalPosts: number;
}

// Messages API Responses
export interface ConversationsResponse extends ApiSuccessResponse {
  count: number;
  conversations: Array<{
    partner: {
      _id: string;
      username: string;
      avatar: string;
      petAvatar: string;
    };
    lastMessage: {
      content: string;
      createdAt: Date;
    };
    unreadCount: number;
  }>;
}

// AI API Responses
export interface AiChatResponse extends ApiSuccessResponse {
  reply: string;
}
