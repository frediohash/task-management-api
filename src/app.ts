import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './utils/ApiError';
import { redisClient } from './config/redis';
import taskRoutes from './routes/task.routes';
import authRoutes from './routes/auth.routes';
import { sanitize } from './middleware/sanitize';
import { config } from './config/config';



const app = express();

// Connect to MongoDB
mongoose.connect(config.mongo.url)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Connect to Redis
redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.on('error', err => console.error('Redis error:', err));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(...sanitize());

// Routes
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    redis: redisClient.status === 'ready' ? 'connected' : 'disconnected'
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use(errorHandler);

export default app;