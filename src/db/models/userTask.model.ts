// (Many-to-Many)
import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

export const UserTaskZodSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/), // Validate as MongoDB ObjectId string
  taskId: z.string().regex(/^[0-9a-fA-F]{24}$/), // Validate as MongoDB ObjectId string
  role: z.enum(['assignee', 'reviewer', 'watcher']).default('assignee'),
  assignedAt: z.date().optional()
});

// Enhanced type that converts string IDs to ObjectId in the document
export type IUserTask = Omit<z.infer<typeof UserTaskZodSchema>, 'userId' | 'taskId'> & {
    userId: mongoose.Types.ObjectId;
    taskId: mongoose.Types.ObjectId;
  } & Document;

const UserTaskSchema = new Schema<IUserTask>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  role: { type: String, enum: ['assignee', 'reviewer', 'watcher'], default: 'assignee' }
}, {
  timestamps: { createdAt: 'assignedAt', updatedAt: false }
});

// Compound index to ensure unique user-task combinations
UserTaskSchema.index({ userId: 1, taskId: 1 }, { unique: true });
UserTaskSchema.index({ taskId: 1 });
UserTaskSchema.index({ role: 1 });

export const UserTaskModel = mongoose.model<IUserTask>('UserTask', UserTaskSchema);