import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Pixel Pet Pals API is running',
    timestamp: new Date().toISOString(),
    architecture: 'Modern TypeScript Architecture'
  });
});

// Test endpoint to verify TypeScript compilation
app.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TypeScript compilation successful!',
    features: [
      'User Repository Layer',
      'User Service Layer', 
      'User Controller Layer',
      'DTO Validation',
      'Type Safety'
    ]
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pixel-pet-pals');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5001;

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Pixel Pet Pals API running on port ${PORT}`);
      console.log(`📚 Modern TypeScript Architecture enabled`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();

export default app; 