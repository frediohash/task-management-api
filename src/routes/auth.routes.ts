import express from 'express';
import { login, refreshToken, register } from '../controllers/auth.controller';
import { rateLimiter } from '../middleware/rateLimit';

const router = express.Router();

// Apply stricter rate limiting to auth routes
router.use(rateLimiter(15, 'Too many requests from this IP, please try again after 15 minutes'));

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

export default router;