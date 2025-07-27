import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import type { IApiResponse, IMessageDocument } from '../types/common.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

interface SendMessageRequest {
  content: string;
}

interface MessageResponse {
  _id: string;
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface GetMessagesResponse extends IApiResponse {
  count?: number;
  messages?: MessageResponse[];
}

interface UnreadCountResponse extends IApiResponse {
  count?: number;
}

interface ConversationPartner {
  _id: string;
  username: string;
  petName: string;
  petAvatar: string;
}

interface Conversation {
  partner: ConversationPartner;
  lastMessage: MessageResponse;
  unreadCount: number;
}

interface ConversationsResponse extends IApiResponse {
  count?: number;
  conversations?: Conversation[];
}

// Remove custom Request interface - use standard Express Request type

// @desc    Send message
// @route   POST /api/messages/:id
// @access  Private
export const sendMessage = async (
  req: Request<
    {
      id: string;
    },
    IApiResponse,
    SendMessageRequest
  >,
  res: Response<Omit<IApiResponse, 'message'> & { message?: string | IMessageDocument }>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Check if recipient exists
    const recipient = await User.findById(id);

    if (!recipient) {
      res.status(404).json({
        success: false,
        message: 'Recipient not found',
      });
      return;
    }

    // // Check if they are friends - REMOVED to allow direct messaging
    // const user = await User.findById(req.user.id);
    //
    // if (!user.friends.includes(id)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'You can only send messages to friends'
    //   });
    // }

    // Create message
    const message = await Message.create({
      sender: req.user?.id,
      recipient: id,
      content,
    });

    // Emit message to recipient via Socket.IO if they are connected
    req?.io?.to(id).emit('private-message', message);

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

// @desc    Get messages with a user
// @route   GET /api/messages/:id
// @access  Private
export const getMessages = async (
  req: Request<{ id: string }>,
  res: Response<GetMessagesResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user exists
    const recipient = await User.findById(id);

    if (!recipient) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Get messages between users
    const messages = await Message.find({
      $or: [
        { sender: req.user?.id, recipient: id },
        { sender: id, recipient: req.user?.id },
      ],
    }).sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany({ sender: id, recipient: req?.user?.id, read: false }, { read: true });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages: messages as unknown as MessageResponse[],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
export const getUnreadCount = async (
  req: Request,
  res: Response<UnreadCountResponse>
): Promise<void> => {
  try {
    // Count unread messages
    const count = await Message.countDocuments({
      recipient: req.user?.id,
      read: false,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

// @desc    Get recent conversations
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (
  req: Request,
  res: Response<ConversationsResponse>
): Promise<void> => {
  try {
    // Get all messages involving the user
    const messages = await Message.find({
      $or: [{ sender: req.user?.id }, { recipient: req.user?.id }],
    }).sort({ createdAt: -1 });

    // Extract unique conversation partners
    const conversationPartners = new Set<string>();
    const conversations: Conversation[] = [];

    for (const message of messages) {
      const partnerId =
        message.sender.toString() === req.user?.id
          ? message.recipient.toString()
          : message.sender.toString();

      if (!conversationPartners.has(partnerId)) {
        conversationPartners.add(partnerId);

        // Get partner details
        const partner = await User.findById(partnerId).select('username petName petAvatar');

        if (!partner) {
          continue;
        }

        // Get unread count
        const unreadCount = await Message.countDocuments({
          sender: partnerId,
          recipient: req.user?.id,
          read: false,
        });

        conversations.push({
          partner: {
            _id: (partner._id as any).toString(),
            username: partner.username,
            petName: partner.petName,
            petAvatar: partner.petAvatar,
          },
          lastMessage: message as MessageResponse,
          unreadCount,
        });
      }

      // Limit to 10 conversations
      if (conversations.length >= 10) break;
    }

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
export const deleteMessage = async (
  req: Request<{ id: string }>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    // Find message
    const message = await Message.findById(id);

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Message not found',
      });
      return;
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to delete this message',
      });
      return;
    }

    // Delete message
    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};
