
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { PostService } from '../../services/PostService.js';
import type {
  CreatePostRequest,
  UpdatePostRequest,
  AddCommentRequest,
  GetAllPostsQuery,
  PostResponse,
  GetAllPostsResponse,
  ErrorResponse
} from '../../dto/PostDto.js';
import { transformPostData } from '../../dto/PostDto.js';

const postService = new PostService();

// Create a new post
export const createPost = async (
  req: Request<{}, PostResponse | ErrorResponse, CreatePostRequest>,
  res: Response<PostResponse | ErrorResponse>
): Promise<void> => {
  try {
    const result = await postService.createPost(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: (error as Error).message });
  }
};

// Get all posts (with pagination and search)
export const getAllPosts = async (
  req: Request<{}, GetAllPostsResponse | ErrorResponse, {}, GetAllPostsQuery>,
  res: Response<GetAllPostsResponse | ErrorResponse>
): Promise<void> => {
  try {
    const result = await postService.getAllPosts(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: (error as Error).message });
  }
};

// Get all posts by a specific user
export const getUserPosts = async (
  req: Request<{ userId: string }>,
  res: Response<PostResponse[] | ErrorResponse>
): Promise<void> => {
  try {
    const result = await postService.getUserPosts(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user posts', error: (error as Error).message });
  }
};

// Get a single post by ID
export const getPostById = async (
  req: Request<{ postId: string }>,
  res: Response<PostResponse | ErrorResponse>
): Promise<void> => {
  try {
    const result = await postService.getPostById(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error: (error as Error).message });
  }
};

// Update a post
export const updatePost = async (
  req: Request<{ postId: string }, PostResponse | ErrorResponse, UpdatePostRequest>,
  res: Response<PostResponse | ErrorResponse>
): Promise<void> => {
  try {
    const result = await postService.updatePost(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error: (error as Error).message });
  }
};

// Delete a post
export const deletePost = async (
  req: Request<{ postId: string }>,
  res: Response<{ message: string; error?: string }>
): Promise<void> => {
  try {
    const result = await postService.deletePost(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: (error as Error).message });
  }
};

// Like/Unlike a post
export const toggleLikePost = async (
  req: Request<{ postId: string }>,
  res: Response<PostResponse | ErrorResponse>
): Promise<void> => {
  try {
    const result = await postService.toggleLikePost(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling like on post', error: (error as Error).message });
  }
};

// Add a comment to a post
export const addCommentToPost = async (
  req: Request<{ postId: string }, PostResponse | ErrorResponse, AddCommentRequest>,
  res: Response<PostResponse | ErrorResponse>
): Promise<void> => {
  try {
    const result = await postService.addCommentToPost(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment to post', error: (error as Error).message });
  }
};

// Delete a comment from a post
export const deleteComment = async (
  req: Request<{ postId: string; commentId: string }>,
  res: Response<PostResponse | ErrorResponse>
): Promise<void> => {
  try {
    const result = await postService.deleteComment(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: (error as Error).message });
  }
};
