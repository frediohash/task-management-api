import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

export const TaskCommentZodSchema = z.object({
  taskId: z.string().regex(/^[0-9a-fA-F]{24}$/), // Validate as MongoDB ObjectId string
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/), // Validate as MongoDB ObjectId string
  comment: z.string().min(1).max(1000),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Enhanced type that converts string IDs to ObjectId in the document
export type ITaskComment = Omit<z.infer<typeof TaskCommentZodSchema>, 'taskId' | 'userId'> & {
    taskId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
  } & Document;
  

const TaskCommentSchema = new Schema<ITaskComment>({
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true }
}, {
  timestamps: true
});

TaskCommentSchema.index({ taskId: 1 });
TaskCommentSchema.index({ userId: 1 });

export const TaskCommentModel = mongoose.model<ITaskComment>('TaskComment', TaskCommentSchema);