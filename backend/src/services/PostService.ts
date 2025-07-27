import { Types } from 'mongoose';
import { PostRepository } from '../repositories/PostRepository.js';
import fs from 'fs';
import path from 'path';
import { transformPostData } from '../dto/PostDto.js';

const postRepository = new PostRepository();

export class PostService {
  async createPost(req: any) {
    try {
      const { content } = req.body;
      const files = req.files as Express.Multer.File[] | undefined;
      if (!content && (!files || files.length === 0)) {
        return { status: 400, data: { message: 'Post content or images cannot be empty.' } };
      }
      const imageUrls: string[] = [];
      if (files && files.length > 0) {
        files.forEach((file: Express.Multer.File) => {
          imageUrls.push(`/uploads/posts/${file.filename}`);
        });
      }
      const newPostData = {
        user: req.user!.id,
        content: content || '',
        imageUrls: imageUrls,
      };
      const post = await postRepository.create(newPostData);
      const populatedPost = await postRepository.findById(
        (post as { _id: Types.ObjectId })._id.toString()
      );
      if (!populatedPost) {
        return { status: 500, data: { message: 'Error creating post' } };
      }
      const transformed = transformPostData(populatedPost, process.env.BACKEND_URL);
      return { status: 201, data: transformed };
    } catch (error) {
      // Clean up uploaded files if error
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
            if (err)
              console.error('Error deleting uploaded file after post creation failure:', err);
          });
        });
      }
      if (error instanceof Error && error.name === 'ValidationError') {
        return { status: 400, data: { message: error.message } };
      }
      return {
        status: 500,
        data: { message: 'Error creating post', error: (error as Error).message },
      };
    }
  }

  async getAllPosts(req: any) {
    try {
      const { page = '1', limit = '10', search } = req.query;
      const query: any = {};
      if (search) {
        query.content = { $regex: search, $options: 'i' };
      }
      const posts = await postRepository.findAll(query, limit, page);
      const count = await postRepository.count(query);
      const transformedPosts = posts.map((post: any) =>
        transformPostData(post, process.env.BACKEND_URL)
      );
      return {
        status: 200,
        data: {
          posts: transformedPosts,
          totalPages: Math.ceil(count / Number(limit)),
          currentPage: parseInt(page),
          totalPosts: count,
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: { message: 'Error fetching posts', error: (error as Error).message },
      };
    }
  }

  async getUserPosts(req: any) {
    try {
      const userId = req.params.userId;
      const posts = await postRepository.findByUser(userId);
      if (!posts) {
        return { status: 200, data: [] };
      }
      const transformedPosts = posts.map((post: any) =>
        transformPostData(post, process.env.BACKEND_URL)
      );
      return { status: 200, data: transformedPosts };
    } catch (error) {
      return {
        status: 500,
        data: { message: 'Error fetching user posts', error: (error as Error).message },
      };
    }
  }

  async getPostById(req: any) {
    try {
      const post = await postRepository.findById(req.params.postId);
      if (!post) {
        return { status: 404, data: { message: 'Post not found' } };
      }
      const transformed = transformPostData(post, process.env.BACKEND_URL);
      return { status: 200, data: transformed };
    } catch (error) {
      return {
        status: 500,
        data: { message: 'Error fetching post', error: (error as Error).message },
      };
    }
  }

  async updatePost(req: any) {
    try {
      const { content } = req.body;
      const post = await postRepository.findById(req.params.postId);
      if (!post) {
        return { status: 404, data: { message: 'Post not found' } };
      }
      if (post.user.toString() !== req.user!.id) {
        return { status: 403, data: { message: 'User not authorized to update this post' } };
      }
      if (content) post.content = content;
      post.updatedAt = new Date();
      await post.save();
      const populatedPost = await postRepository.findById(
        (post as { _id: Types.ObjectId })._id.toString()
      );
      if (!populatedPost) {
        return { status: 500, data: { message: 'Error updating post' } };
      }
      const transformed = transformPostData(populatedPost, process.env.BACKEND_URL);
      return { status: 200, data: transformed };
    } catch (error) {
      if (error instanceof Error && error.name === 'ValidationError') {
        return { status: 400, data: { message: error.message } };
      }
      return {
        status: 500,
        data: { message: 'Error updating post', error: (error as Error).message },
      };
    }
  }

  async deletePost(req: any) {
    try {
      const post = await postRepository.findById(req.params.postId);
      if (!post) {
        return { status: 404, data: { message: 'Post not found' } };
      }
      if (post.user.toString() !== req.user!.id) {
        return { status: 403, data: { message: 'User not authorized to delete this post' } };
      }
      if (post.imageUrls && post.imageUrls.length > 0) {
        post.imageUrls.forEach((imageUrl: string) => {
          const imagePath = path.join(__dirname, '../../public', imageUrl);
          if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, err => {
              if (err) console.error('Error deleting post image:', err);
            });
          }
        });
      }
      await post.deleteOne();
      return { status: 200, data: { message: 'Post deleted successfully' } };
    } catch (error) {
      return {
        status: 500,
        data: { message: 'Error deleting post', error: (error as Error).message },
      };
    }
  }

  async toggleLikePost(req: any) {
    try {
      const post = await postRepository.findById(req.params.postId);
      if (!post) {
        return { status: 404, data: { message: 'Post not found' } };
      }
      const userId = req.user!.id;
      const likeIndex = post.likes.findIndex((likeId: any) => likeId.toString() === userId);
      if (likeIndex > -1) {
        post.likes.splice(likeIndex, 1);
      } else {
        post.likes.push(new Types.ObjectId(userId));
      }
      await post.save();
      const populatedPost = await postRepository.findById(
        (post as { _id: Types.ObjectId })._id.toString()
      );
      if (!populatedPost) {
        return { status: 500, data: { message: 'Error updating post like' } };
      }
      const transformed = transformPostData(populatedPost, process.env.BACKEND_URL);
      return { status: 200, data: transformed };
    } catch (error) {
      return {
        status: 500,
        data: { message: 'Error toggling like on post', error: (error as Error).message },
      };
    }
  }

  async addCommentToPost(req: any) {
    try {
      const { text } = req.body;
      if (!text) {
        return { status: 400, data: { message: 'Comment text cannot be empty.' } };
      }
      const post = await postRepository.findById(req.params.postId);
      if (!post) {
        return { status: 404, data: { message: 'Post not found' } };
      }
      const newComment = {
        user: new Types.ObjectId(req.user!.id),
        text: text,
        createdAt: new Date(),
      };
      post.comments.push(newComment);
      await post.save();
      const populatedPost = await postRepository.findById(
        (post as { _id: Types.ObjectId })._id.toString()
      );
      if (!populatedPost) {
        return { status: 500, data: { message: 'Error adding comment' } };
      }
      const transformed = transformPostData(populatedPost, process.env.BACKEND_URL);
      return { status: 201, data: transformed };
    } catch (error) {
      return {
        status: 500,
        data: { message: 'Error adding comment to post', error: (error as Error).message },
      };
    }
  }

  async deleteComment(req: any) {
    try {
      const { postId, commentId } = req.params;
      const post = await postRepository.findById(postId);
      if (!post) {
        return { status: 404, data: { message: 'Post not found' } };
      }
      const commentDoc = post.comments.find((c: any) => c._id?.toString() === commentId);
      if (!commentDoc) {
        return { status: 404, data: { message: 'Comment not found' } };
      }
      if (commentDoc.user.toString() !== req.user!.id && post.user.toString() !== req.user!.id) {
        return { status: 403, data: { message: 'User not authorized to delete this comment' } };
      }
      post.comments = post.comments.filter((c: any) => c._id?.toString() !== commentId);
      await post.save();
      const populatedPost = await postRepository.findById(
        (post as { _id: Types.ObjectId })._id.toString()
      );
      if (!populatedPost) {
        return { status: 500, data: { message: 'Error deleting comment' } };
      }
      const transformed = transformPostData(populatedPost, process.env.BACKEND_URL);
      return { status: 200, data: transformed };
    } catch (error) {
      return {
        status: 500,
        data: { message: 'Error deleting comment', error: (error as Error).message },
      };
    }
  }
}
