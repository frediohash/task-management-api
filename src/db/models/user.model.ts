import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

export const UserZodSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'manager', 'user']).default('user'),
  refreshToken: z.string().optional(),
});

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'user';
  refreshToken?: string;
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
  refreshToken: { type: String },
}, {
  timestamps: true
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);