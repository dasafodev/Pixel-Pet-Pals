import { Schema, model, type Model } from 'mongoose';
import type { Document, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import type { IUserDocument } from '@/types/common.js';

// User model interface
interface IUserModel extends Model<IUserDocument> {}

const UserSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    avatar: {
      // User's own avatar
      type: String,
      default: '/avatars/avatar_1.png', // Default user avatar
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    petName: {
      type: String,
      required: true,
      trim: true,
    },
    petAvatar: {
      type: String,
      default: '/pets/pet_1.png', // Default pet avatar path
    },
    petToys: {
      // Added petToys field
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: '',
      maxlength: 200,
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    friendRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  this: IUserDocument,
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the model
const User: IUserModel = model<IUserDocument, IUserModel>('User', UserSchema);

export default User;
export type { IUserDocument };
