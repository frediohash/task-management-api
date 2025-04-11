import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

export const UserZodSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'manager', 'user']).default('user'),
  refreshToken: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type IUser = z.infer<typeof UserZodSchema> & Document;

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
  refreshToken: { type: String },
}, {
  timestamps: true
});

UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });

export const UserModel = mongoose.model<IUser>('User', UserSchema);