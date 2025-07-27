import Post from '../models/Post.js';
import type { IPostDocument } from '../types/common';

export class PostRepository {
  async create(postData: Partial<IPostDocument>) {
    return Post.create(postData);
  }

  async findById(id: string) {
    return Post.findById(id)
      .populate('user', 'username avatar petAvatar')
      .populate('comments.user', 'username avatar petAvatar')
      .populate('likes', 'username avatar petAvatar');
  }

  async findAll(query: any = {}, limit: string | number = 10, page: string | number = 1) {
    return Post.find(query)
      .populate('user', 'username avatar petAvatar')
      .populate('comments.user', 'username avatar petAvatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .exec();
  }

  async count(query: any = {}) {
    return Post.countDocuments(query);
  }

  async findByUser(userId: string) {
    return Post.find({ user: userId })
      .populate('user', 'username avatar petAvatar')
      .populate('comments.user', 'username avatar petAvatar')
      .sort({ createdAt: -1 });
  }

  async update(id: string, updateData: Partial<IPostDocument>) {
    return Post.findByIdAndUpdate(id, updateData, { new: true })
      .populate('user', 'username avatar petAvatar')
      .populate('comments.user', 'username avatar petAvatar');
  }

  async delete(id: string) {
    return Post.findByIdAndDelete(id);
  }
}
