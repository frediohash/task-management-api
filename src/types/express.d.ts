import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      sanitizedQuery?: any;
    }

    interface User {
      id: string | Types.ObjectId;
      role: string;
    }

    interface Request {
      user: User;
    }
  }
}