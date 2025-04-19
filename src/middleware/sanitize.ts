// src/middleware/sanitize.ts
import { Request, Response, NextFunction } from 'express';
import sanitize from 'mongo-sanitize';

const deepSanitize = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return sanitize(obj);
  }
  
  return Object.keys(obj).reduce((acc: any, key) => {
    acc[sanitize(key)] = deepSanitize(obj[key]);
    return acc;
  }, Array.isArray(obj) ? [] : {});
};

export const sanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body) req.body = deepSanitize(req.body);
    if (req.query) req.query = deepSanitize(req.query);
    if (req.params) req.params = deepSanitize(req.params);
    next();
  } catch (error) {
    res.status(500).json({ error: 'Sanitization failed' });
  }
};

export { sanitize };
