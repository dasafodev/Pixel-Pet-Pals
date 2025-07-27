import { Schema, model, type Model } from 'mongoose';
import type { Document, Types } from 'mongoose';
import type { IPostDocument, ICommentDocument } from '../types/common';

// Post model interface
interface IPostModel extends Model<IPostDocument> {}

const commentSchema = new Schema<ICommentDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const postSchema = new Schema<IPostDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    imageUrls: {
      // Renamed from imageUrl to imageUrls for clarity
      type: [String], // Array of strings for multiple image paths
      validate: [arrayLimit, '{PATH} exceeds the limit of 9 images'],
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [commentSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
); // timestamps will automatically manage createdAt and updatedAt

// Validator for limiting the number of images
function arrayLimit(val: string[]): boolean {
  return val.length <= 9;
}

// Create and export the model
const Post: IPostModel = model<IPostDocument, IPostModel>('Post', postSchema);

export default Post;
export type { IPostDocument, ICommentDocument };
