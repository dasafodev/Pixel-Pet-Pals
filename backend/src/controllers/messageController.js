const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send message
// @route   POST /api/messages/:id
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    // Check if recipient exists
    const recipient = await User.findById(id);
    
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
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
      sender: req.user.id,
      recipient: id,
      content
    });
    
    // Emit message to recipient via Socket.IO if they are connected
    req.io.to(id).emit('private-message', message); 
    
    res.status(201).json({
      success: true,
      message // Send back the created message object
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get messages with a user
// @route   GET /api/messages/:id
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const recipient = await User.findById(id);
    
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get messages between users
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: id },
        { sender: id, recipient: req.user.id }
      ]
    }).sort({ createdAt: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      { sender: id, recipient: req.user.id, read: false },
      { read: true }
    );
    
    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    // Count unread messages
    const count = await Message.countDocuments({
      recipient: req.user.id,
      read: false
    });
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get recent conversations
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    // Get all messages involving the user
    const messages = await Message.find({
      $or: [
        { sender: req.user.id },
        { recipient: req.user.id }
      ]
    }).sort({ createdAt: -1 });
    
    // Extract unique conversation partners
    const conversationPartners = new Set();
    const conversations = [];
    
    for (const message of messages) {
      const partnerId = message.sender.toString() === req.user.id 
        ? message.recipient.toString() 
        : message.sender.toString();
      
      if (!conversationPartners.has(partnerId)) {
        conversationPartners.add(partnerId);
        
        // Get partner details
        const partner = await User.findById(partnerId).select('username petName petAvatar');
        
        // Get unread count
        const unreadCount = await Message.countDocuments({
          sender: partnerId,
          recipient: req.user.id,
          read: false
        });
        
        conversations.push({
          partner,
          lastMessage: message,
          unreadCount
        });
      }
      
      // Limit to 10 conversations
      if (conversations.length >= 10) break;
    }
    
    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find message
    const message = await Message.findById(id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Check if user is the sender
    if (message.sender.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }
    
    // Delete message
    await message.remove();
    
    res.status(200).json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
