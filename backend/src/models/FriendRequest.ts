import { model, type Model, Schema } from 'mongoose';
import type { IFriendRequestDocument } from '../types/common.js';

// FriendRequest model interface
interface IFriendRequestModel extends Model<IFriendRequestDocument> {}

const FriendRequestSchema = new Schema<IFriendRequestDocument>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'] as const,
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure uniqueness of friend requests
FriendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });

// Create and export the model
const FriendRequest: IFriendRequestModel = model<IFriendRequestDocument, IFriendRequestModel>(
  'FriendRequest',
  FriendRequestSchema
);

export default FriendRequest;
export type { IFriendRequestDocument };
