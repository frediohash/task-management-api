import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

export const TaskHistoryZodSchema = z.object({
  taskId: z.instanceof(mongoose.Types.ObjectId).or(z.string().regex(/^[0-9a-fA-F]{24}$/)),
  changedBy: z.instanceof(mongoose.Types.ObjectId).or(z.string().regex(/^[0-9a-fA-F]{24}$/)),
  changeType: z.enum(['status_change', 'assignment', 'creation', 'deletion', 'update']),
  previousState: z.any().optional(),
  newState: z.any().optional(),
  changedAt: z.date().optional()
});

export type ITaskHistory = Omit<z.infer<typeof TaskHistoryZodSchema>, 'taskId' | 'changedBy'> & {
    taskId: mongoose.Types.ObjectId;
    changedBy: mongoose.Types.ObjectId;
  } & Document;

const TaskHistorySchema = new Schema<ITaskHistory>({
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changeType: { type: String, required: true },
  previousState: { type: Schema.Types.Mixed },
  newState: { type: Schema.Types.Mixed }
}, {
  timestamps: { createdAt: 'changedAt', updatedAt: false }
});

TaskHistorySchema.index({ taskId: 1 });
TaskHistorySchema.index({ changedBy: 1 });
TaskHistorySchema.index({ changeType: 1 });

export const TaskHistoryModel = mongoose.model<ITaskHistory>('TaskHistory', TaskHistorySchema);