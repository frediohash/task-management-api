import mongoSanitize from 'express-mongo-sanitize';
import { RequestHandler } from 'express';

export const sanitize = (): RequestHandler[] => {
  return [
    // Sanitize request data
    mongoSanitize(),
    // XSS protection
    (req, res, next) => {
      // Sanitize req.body
      if (req.body) {
        Object.keys(req.body).forEach(key => {
          if (typeof req.body[key] === 'string') {
            req.body[key] = req.body[key].replace(/<[^>]*>?/gm, '');
          }
        });
      }
      
      // Sanitize req.query
      if (req.query) {
        Object.keys(req.query).forEach(key => {
          if (typeof req.query[key] === 'string') {
            req.query[key] = (req.query[key] as string).replace(/<[^>]*>?/gm, '');
          }
        });
      }
      
      next();
    }
  ];
};