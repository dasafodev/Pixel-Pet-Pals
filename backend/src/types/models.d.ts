declare module '../models/User' {
  import { Document, Types } from 'mongoose';
  
  interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    avatar: string;
    email: string;
    password: string;
    petName: string;
    petAvatar: string;
    petToys: string[];
    bio: string;
    friends: Types.ObjectId[];
    friendRequests: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    toObject(): any;
  }
  
  const User: any;
  export default User;
}

declare module '../models/Post' {
  import { Document, Types } from 'mongoose';
  
  interface IPost extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    content: string;
    image?: string;
    likes: Types.ObjectId[];
    comments: Array<{
      user: Types.ObjectId;
      content: string;
      createdAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }
  
  const Post: any;
  export default Post;
}

declare module '../models/FriendRequest' {
  import { Document, Types } from 'mongoose';
  
  interface IFriendRequest extends Document {
    _id: Types.ObjectId;
    sender: Types.ObjectId;
    recipient: Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
  }
  
  const FriendRequest: any;
  export default FriendRequest;
} 