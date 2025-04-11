import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

export const TaskStatus = ['pending', 'in_progress', 'completed', 'archived'] as const;

export const TaskZodSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  status: z.enum(TaskStatus).default('pending'),
  dueDate: z.date().optional(),
  createdBy: z.string().regex(/^[0-9a-fA-F]{24}$/), // Validate as MongoDB ObjectId string
  assignedTo: z.array(z.string()).optional(), // Array of User IDs
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type ITask = Omit<z.infer<typeof TaskZodSchema>, 'createdBy' | 'assignedTo'> & {
    createdBy: mongoose.Types.ObjectId;
    assignedTo: mongoose.Types.ObjectId[];
  } & Document;

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: TaskStatus, default: 'pending' },
  dueDate: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

TaskSchema.index({ title: 'text', description: 'text' });
TaskSchema.index({ status: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ createdBy: 1 });
TaskSchema.index({ assignedTo: 1 });

export const TaskModel = mongoose.model<ITask>('Task', TaskSchema);