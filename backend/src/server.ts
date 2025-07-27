import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import type { Socket } from 'socket.io';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './routes/auth.js';
import friendRoutes from './routes/friends.js';
import messageRoutes from './routes/messages.js';
import aiRoutes from './routes/ai.js';
import postRoutes from './routes/posts.js';
import eventRoutes from './routes/events.js';
import path from 'path';
import { fileURLToPath } from 'url';
import Message from './models/Message.js';
import { Routes } from '@/routes/ts/index.js';
// Load environment variables AT THE VERY TOP
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Socket.IO event interfaces
interface PrivateMessageData {
  sender: string;
  recipient: string;
  content: string;
}

interface TypingData {
  sender: string;
  recipient: string;
}

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

// Serve static files from the 'public' directory (for uploads)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pet-social')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err: Error) => console.error('MongoDB connection error:', err));

// Socket.io connection
io.on('connection', (socket: Socket) => {
  console.log('New client connected:', socket.id);

  // Join a room (for private messaging)
  socket.on('join', (userId: string) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Handle private messages
  socket.on('private-message', async ({ sender, recipient, content }: PrivateMessageData) => {
    try {
      // Store message in database
      const message = await Message.create({
        sender,
        recipient,
        content,
      });

      // Emit to recipient
      io.to(recipient).emit('private-message', message);
      // Emit back to sender for confirmation
      io.to(sender).emit('private-message', message);
    } catch (error) {
      console.error('Error saving message:', error);
      io.to(sender).emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', ({ sender, recipient }: TypingData) => {
    io.to(recipient).emit('typing', { sender });
  });

  // Handle stop typing indicators
  socket.on('stop-typing', ({ sender, recipient }: TypingData) => {
    io.to(recipient).emit('stop-typing', { sender });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

/**
 * Initialize New Routes
 */
const apiRoutes = new Routes();

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/events', eventRoutes);

/**
 * New Routes
 */
app.use('/api', apiRoutes.getRouter());

// Root route
app.get('/', (req, res) => {
  res.send('Pet Social API is running');
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
