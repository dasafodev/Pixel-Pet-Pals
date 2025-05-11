const dotenv = require('dotenv');
// Load environment variables AT THE VERY TOP
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const friendRoutes = require('./routes/friends');
const messageRoutes = require('./routes/messages');
const aiRoutes = require('./routes/ai'); // Import AI routes
const postRoutes = require('./routes/posts'); // Import Post routes
const eventRoutes = require('./routes/events'); // Import Event routes
const path = require('path'); // For serving static files

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // Use environment variable
  credentials: true,
}));
app.use(express.json());

// Serve static files from the 'public' directory (for uploads)
// __dirname is /Users/mac/my-app/backend/src, so we need to go up one level for 'public'
app.use(express.static(path.join(__dirname, '..', 'public')));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pet-social', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join a room (for private messaging)
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
  
  // Handle private messages
  socket.on('private-message', ({ sender, recipient, content }) => {
    // Store message in database
    const Message = require('./models/Message');
    Message.create({
      sender,
      recipient,
      content
    }).then(message => {
      // Emit to recipient
      io.to(recipient).emit('private-message', message);
      // Emit back to sender for confirmation
      io.to(sender).emit('private-message', message);
    }).catch(error => {
      console.error('Error saving message:', error);
      io.to(sender).emit('error', { message: 'Failed to send message' });
    });
  });
  
  // Handle typing indicators
  socket.on('typing', ({ sender, recipient }) => {
    io.to(recipient).emit('typing', { sender });
  });
  
  // Handle stop typing indicators
  socket.on('stop-typing', ({ sender, recipient }) => {
    io.to(recipient).emit('stop-typing', { sender });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes); // Use AI routes
app.use('/api/posts', postRoutes); // Use Post routes
app.use('/api/events', eventRoutes); // Use Event routes

// Root route
app.get('/', (req, res) => {
  res.send('Pet Social API is running');
});

// Start server
const PORT = process.env.PORT || 5001; // Changed default port to 5001
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
