import express from 'express';
import {
  createTask,
  getTask,
  updateTask,
  deleteTask,
  getUserTasks,
  getTaskHistory,
  getTaskInteractions
} from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimit';
import { catchAsync } from '../utils/catchAsync';

const router = express.Router();

// Apply rate limiting to all task routes
router.use(rateLimiter(15, 'Too many requests, try again later', 10));

// Task CRUD routes
router.post('/', authenticate, authorize(['admin', 'manager']), createTask);
router.get('/:id', authenticate, getTask);
router.put('/:id', authenticate, authorize(['admin', 'manager']), updateTask);
router.delete('/:id', authenticate, authorize(['admin', 'manager']), deleteTask);

// User tasks with pagination and filtering
router.get('/user/:id', authenticate, catchAsync(getUserTasks));
// Task history and interactions
router.get('/:id/history', authenticate, getTaskHistory);
router.get('/:id/interactions', authenticate, getTaskInteractions);

export default router;