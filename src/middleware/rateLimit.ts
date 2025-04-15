// src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import { RateLimitRequestHandler } from 'express-rate-limit';

export const rateLimiter = (
  minutes: number,
  message: string,
  maxRequests = 100
): RateLimitRequestHandler => {
  return rateLimit({
    windowMs: minutes * 60 * 1000,
    max: maxRequests,
    message,
  });
};
