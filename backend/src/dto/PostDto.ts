
// Request DTOs
export interface CreatePostRequest {
  content?: string;
}
export interface UpdatePostRequest {
  content?: string;
}
export interface AddCommentRequest {
  text: string;
}
export interface GetAllPostsQuery {
  page?: string;
  limit?: string;
  search?: string;
}

// Response DTOs
export interface PostUser {
  _id: string;
  username: string;
  avatar: string;
  petAvatar: string;
}
export interface Comment {
  _id: string;
  user: PostUser;
  text: string;
  createdAt: Date;
}
export interface PostResponse {
  _id: string;
  user: PostUser;
  content: string;
  imageUrls: string[];
  likes: (string | PostUser)[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}
export interface GetAllPostsResponse {
  posts: PostResponse[];
  totalPages: number;
  currentPage: number;
  totalPosts: number;
}
export interface ErrorResponse {
  success?: false;
  message: string;
  error?: string;
}

// Helper function to transform image URLs to absolute paths
export const transformPostData = (postData: any, backendUrl?: string): PostResponse => {
  if (!backendUrl) return postData; // Safety check

  // Ensure postData is a plain object for modification
  const transformedData = postData.toObject ? postData.toObject() : { ...postData };

  // Transform post.imageUrls
  if (transformedData.imageUrls && Array.isArray(transformedData.imageUrls)) {
    transformedData.imageUrls = transformedData.imageUrls.map((url: string) =>
      url && !url.startsWith('http') ? `${backendUrl}${url}` : url
    );
  }

  // Transform user avatar and petAvatar in post.user
  if (transformedData.user) {
    if (transformedData.user.avatar && !transformedData.user.avatar.startsWith('http')) {
      transformedData.user.avatar = `${backendUrl}${transformedData.user.avatar}`;
    }
    if (transformedData.user.petAvatar && !transformedData.user.petAvatar.startsWith('http')) {
      transformedData.user.petAvatar = `${backendUrl}${transformedData.user.petAvatar}`;
    }
  }

  // Transform avatars in post.comments[].user
  if (transformedData.comments && Array.isArray(transformedData.comments)) {
    transformedData.comments = transformedData.comments.map((comment: any) => {
      if (comment.user) {
        if (comment.user.avatar && !comment.user.avatar.startsWith('http')) {
          comment.user.avatar = `${backendUrl}${comment.user.avatar}`;
        }
        if (comment.user.petAvatar && !comment.user.petAvatar.startsWith('http')) {
          comment.user.petAvatar = `${backendUrl}${comment.user.petAvatar}`;
        }
      }
      return comment;
    });
  }

  // Transform avatars in post.likes[] (if populated user objects)
  if (transformedData.likes && Array.isArray(transformedData.likes)) {
    transformedData.likes = transformedData.likes.map((like: any) => {
      // Check if 'like' is a populated user object
      if (like && typeof like === 'object' && like._id) {
        if (like.avatar && !like.avatar.startsWith('http')) {
          like.avatar = `${backendUrl}${like.avatar}`;
        }
        if (like.petAvatar && !like.petAvatar.startsWith('http')) {
          like.petAvatar = `${backendUrl}${like.petAvatar}`;
        }
      }
      return like;
    });
  }

  return transformedData;
};
