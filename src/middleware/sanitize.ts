// src/middleware/sanitize.ts
import { Request, Response, NextFunction } from 'express';
import sanitize from 'mongo-sanitize';

// Keep your deepSanitize function and export if needed
const deepSanitize = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return sanitize(obj);
  }

  return Object.keys(obj).reduce((acc: any, key) => {
    const cleanKey = sanitize(key);
    acc[cleanKey] = deepSanitize(obj[key]);
    return acc;
  }, Array.isArray(obj) ? [] : {});
};

// ✅ TEMP: Replace middleware with debug version
export const sanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔥 Incoming request:', {
      bodyType: typeof req.body,
      queryType: typeof req.query,
      body: req.body,
      query: req.query,
      params: req.params
    });

    next();
  } catch (err) {
    console.error('🔥 Logging error:', err);
    res.status(500).json({ error: 'Logging failed' });
  }
};


// You can still export the deepSanitize or sanitize function if used elsewhere
export { sanitize };
