import { Schema, model, type Model } from 'mongoose';
import type { Document, Types } from 'mongoose';
import type { IMessageDocument } from '../types/common';

// Message model interface
interface IMessageModel extends Model<IMessageDocument> {}

const MessageSchema = new Schema<IMessageDocument>(
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
    content: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
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

// Index for efficient querying of conversations
MessageSchema.index({ sender: 1, recipient: 1 });

// Create and export the model
const Message: IMessageModel = model<IMessageDocument, IMessageModel>('Message', MessageSchema);

export default Message;
export type { IMessageDocument };
