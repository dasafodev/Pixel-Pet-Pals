import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Routes } from './routes/ts/index.js';
import { protect } from './middleware/ts/auth.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('public/uploads'));

// API Routes with modern architecture
const apiRoutes = new Routes();
app.use('/api', protect, apiRoutes.getRouter());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Pixel Pet Pals API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Pixel Pet Pals API running on port ${PORT}`);
  console.log(`📚 Modern architecture enabled`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
