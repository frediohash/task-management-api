import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface User {
      id: string | Types.ObjectId;
      role: string;
    }

    interface Request {
      user: User;
    }
  }
}