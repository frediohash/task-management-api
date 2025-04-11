import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';
import { UserModel } from '../db/models/user.model';
import { ApiError } from '../utils/ApiError';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Unauthorized - No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      throw new ApiError(401, 'Unauthorized - User not found');
    }

    req.user = {
      id: user._id.toString(),
      role: user.role
    };

    next();
  } catch (error) {
    next(new ApiError(401, 'Unauthorized - Invalid token'));
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden - Insufficient permissions'));
    }
    next();
  };
};