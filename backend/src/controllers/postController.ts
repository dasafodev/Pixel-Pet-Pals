import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import type { IApiResponse, AuthenticatedUser } from '@/types/common.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';

interface CreatePostRequest {
  content?: string;
}

interface UpdatePostRequest {
  content?: string;
}

interface AddCommentRequest {
  text: string;
}

interface GetAllPostsQuery {
  page?: string;
  limit?: string;
  search?: string;
}

interface PostUser {
  _id: string;
  username: string;
  avatar: string;
  petAvatar: string;
}

interface Comment {
  _id: string;
  user: PostUser;
  text: string;
  createdAt: Date;
}

interface PostResponse {
  _id: string;
  user: PostUser;
  content: string;
  imageUrls: string[];
  likes: (string | PostUser)[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

interface GetAllPostsResponse {
  posts: PostResponse[];
  totalPages: number;
  currentPage: number;
  totalPosts: number;
}

interface ErrorResponse {
  success?: false;
  message: string;
  error?: string;
}

// Remove custom Request interface - use standard Express Request type

// Helper function to transform image URLs to absolute paths
const transformPostData = (postData: any, backendUrl?: string): PostResponse => {
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

// Create a new post
export const createPost = async (
  req: Request<{}, PostResponse | ErrorResponse, CreatePostRequest>,
  res: Response<PostResponse | ErrorResponse>
): Promise<void> => {
  try {
    const { content } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    if (!content && (!files || files.length === 0)) {
      // Content or images must be present
      res.status(400).json({ message: 'Post content or images cannot be empty.' });
      return;
    }

    const imageUrls: string[] = [];
    if (files && files.length > 0) {
      files.forEach((file: Express.Multer.File) => {
        // Construct the URL path for each image
        imageUrls.push(`/uploads/posts/${file.filename}`);
      });
    }

    const newPostData = {
      user: req.user!.id, // Assuming req.user is populated by auth middleware
      content: content || '', // Allow empty content if images are present
      imageUrls: imageUrls,
    };

    const post = new Post(newPostData);
    await post.save();

    // Populate user details for the created post
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username avatar petAvatar')
      .populate('comments.user', 'username avatar petAvatar');

    if (!populatedPost) {
      res.status(500).json({ message: 'Error creating post' });
      return;
    }

    // Transform image URLs before sending the response
    const transformedPopulatedPost = transformPostData(populatedPost, process.env.BACKEND_URL);
    res.status(201).json(transformedPopulatedPost);
  } catch (error) {
    // If post creation fails after image upload, attempt to delete uploaded files
    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      files.forEach((file: Express.Multer.File) => {
        const filePath = path.join(
          __dirname,
          '..',
          '..',
          'public',
          'uploads',
          'posts',
          file.filename
        );
        fs.unlink(filePath, err => {
          if (err) console.error('Error deleting uploaded file after post creation failure:', err);
        });
      });
    }
    // Handle Mongoose validation errors (e.g., too many images)
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Error creating post', error: (error as Error).message });
  }
};

// Get all posts (with pagination and search)
export const getAllPosts = async (
  req: Request<{}, GetAllPostsResponse | ErrorResponse, {}, GetAllPostsQuery>,
  res: Response<GetAllPostsResponse | ErrorResponse>
): Promise<void> => {
  try {
    const { page = '1', limit = '10', search } = req.query;
    const query: any = {};

    if (search) {
      // Add search condition for post content (case-insensitive)
      query.content = { $regex: search, $options: 'i' };
    }

    const posts = await Post.find(query)
      .populate('user', 'username avatar petAvatar')
      .populate('comments.user', 'username avatar petAvatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit)) // Convert limit to number
      .skip((Number(page) - 1) * Number(limit)) // Convert page to number
      .exec();

    // Get total documents for pagination
    const count = await Post.countDocuments(query);

    const transformedPosts = posts.map(post => transformPostData(post, process.env.BACKEND_URL));

    res.status(200).json({
      posts: transformedPosts,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: parseInt(page),
      totalPosts: count,
    });
  } catch (error) {
    console.error('Error in getAllPosts:', error); // Added console.error for better debugging
    res.status(500).json({ message: 'Error fetching posts', error: (error as Error).message });
  }
};

// Get all posts by a specific user
export const getUserPosts = async (
  req: Request<{
    userId: string;
  }>,
  res: Response<PostResponse[] | ErrorResponse>
): Promise<void> => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ user: userId })
      .populate('user', 'username avatar petAvatar') // Added petAvatar
      .populate('comments.user', 'username avatar petAvatar') // Added petAvatar
      .sort({ createdAt: -1 });

    if (!posts) {
      // Send empty array if no posts, or handle as preferred
      res.status(200).json([]);
      return;
    }

    const transformedPosts = posts.map(post => transformPostData(post, process.env.BACKEND_URL));
    res.status(200).json(transformedPosts);
  } catch (error) {
    console.error('Error in getUserPosts:', error); // Added console.error
    res.status(500).json({ message: 'Error fetching user posts', error: (error as Error).message });
  }
};

// Get a single post by ID
export const getPostById = async (
  req: Request<{
    postId: string;
  }>,
  res: Response<PostResponse | ErrorResponse>
): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('user', 'username avatar petAvatar') // Added petAvatar
      .populate('comments.user', 'username avatar petAvatar'); // Added petAvatar
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    const transformedPost = transformPostData(post, process.env.BACKEND_URL);
    res.status(200).json(transformedPost);
  } catch (error) {
    console.error('Error in getPostById:', error); // Added console.error
    res.status(500).json({ message: 'Error fetching post', error: (error as Error).message });
  }
};

// Update a post
export const updatePost = async (
  req: Request<
    {
      postId: string;
    },
    PostResponse | ErrorResponse,
    UpdatePostRequest
  >,
  res: Response<PostResponse | ErrorResponse>
): Promise<void> => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Check if the logged-in user is the author of the post
    if (post.user.toString() !== req.user!.id) {
      res.status(403).json({ message: 'User not authorized to update this post' });
      return;
    }

    if (content) post.content = content;
    // Image update logic can be added here if needed (delete old, upload new)
    // For simplicity, current updatePost does not handle image changes.
    // A more complex implementation would involve checking for new req.files,
    // deleting old images from post.imageUrls, and adding new ones.

    post.updatedAt = new Date(); // Handled by timestamps: true in schema
    await post.save();
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username avatar petAvatar')
      .populate('comments.user', 'username avatar petAvatar');

    if (!populatedPost) {
      res.status(500).json({ message: 'Error updating post' });
      return;
    }

    const transformedPopulatedPost = transformPostData(populatedPost, process.env.BACKEND_URL);
    res.status(200).json(transformedPopulatedPost);
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Error updating post', error: (error as Error).message });
  }
};

// Delete a post
export const deletePost = async (
  req: Request<{ postId: string }>,
  res: Response<{
    message: string;
    error?: string;
  }>
): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    if (post.user.toString() !== req.user!.id) {
      res.status(403).json({ message: 'User not authorized to delete this post' });
      return;
    }

    // If post has images, delete them from the server
    if (post.imageUrls && post.imageUrls.length > 0) {
      post.imageUrls.forEach(imageUrl => {
        const imagePath = path.join(__dirname, '../../public', imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlink(imagePath, err => {
            if (err) console.error('Error deleting post image:', err);
          });
        }
      });
    }

    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: (error as Error).message });
  }
};

// Like/Unlike a post
export const toggleLikePost = async (
  req: Request<{
    postId: string;
  }>,
  res: Response<PostResponse | ErrorResponse>
): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const userId = req.user!.id;
    const likeIndex = post.likes.findIndex(
      (likeId: Types.ObjectId) => likeId.toString() === userId
    );

    if (likeIndex > -1) {
      // User has already liked, so unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // User has not liked, so like
      post.likes.push(new Types.ObjectId(userId));
    }

    await post.save();
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username avatar petAvatar')
      .populate('likes', 'username avatar petAvatar')
      .populate('comments.user', 'username avatar petAvatar');

    if (!populatedPost) {
      res.status(500).json({ message: 'Error updating post like' });
      return;
    }

    const transformedPopulatedPost = transformPostData(populatedPost, process.env.BACKEND_URL);
    res.status(200).json(transformedPopulatedPost);
  } catch (error) {
    console.error('Error in toggleLikePost:', error); // Added console.error
    res
      .status(500)
      .json({ message: 'Error toggling like on post', error: (error as Error).message });
  }
};

// Add a comment to a post
export const addCommentToPost = async (
  req: Request<
    {
      postId: string;
    },
    PostResponse | ErrorResponse,
    AddCommentRequest
  >,
  res: Response<PostResponse | ErrorResponse>
): Promise<void> => {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ message: 'Comment text cannot be empty.' });
      return;
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const newComment = {
      user: new Types.ObjectId(req.user!.id),
      text: text,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the newly added comment and the post
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username avatar petAvatar') // Added petAvatar
      .populate('likes', 'username avatar petAvatar') // Added petAvatar
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username avatar petAvatar',
        },
      });

    if (!populatedPost) {
      res.status(500).json({ message: 'Error adding comment' });
      return;
    }

    const transformedPopulatedPost = transformPostData(populatedPost, process.env.BACKEND_URL);
    res.status(201).json(transformedPopulatedPost);
  } catch (error) {
    console.error('Error in addCommentToPost:', error); // Added console.error
    res
      .status(500)
      .json({ message: 'Error adding comment to post', error: (error as Error).message });
  }
};

// Delete a comment from a post
export const deleteComment = async (
  req: Request<{
    postId: string;
    commentId: string;
  }>,
  res: Response<PostResponse | ErrorResponse>
): Promise<void> => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const commentDoc = post.comments.find(c => c._id?.toString() === commentId);
    if (!commentDoc) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    // Check if the logged-in user is the author of the comment or the author of the post
    if (commentDoc.user.toString() !== req.user!.id && post.user.toString() !== req.user!.id) {
      res.status(403).json({ message: 'User not authorized to delete this comment' });
      return;
    }

    // Remove comment by filtering
    post.comments = post.comments.filter(c => c._id?.toString() !== commentId);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username avatar petAvatar') // Added petAvatar
      .populate('likes', 'username avatar petAvatar') // Added petAvatar
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username avatar petAvatar', // Added petAvatar
        },
      });

    if (!populatedPost) {
      res.status(500).json({ message: 'Error deleting comment' });
      return;
    }

    const transformedPopulatedPost = transformPostData(populatedPost, process.env.BACKEND_URL);
    res.status(200).json(transformedPopulatedPost);
  } catch (error) {
    console.error('Error in deleteComment:', error); // Added console.error
    res.status(500).json({ message: 'Error deleting comment', error: (error as Error).message });
  }
};
