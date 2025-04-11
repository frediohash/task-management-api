import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

export const NotificationZodSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/), // Validate as MongoDB ObjectId string
  taskId: z.string().regex(/^[0-9a-fA-F]{24}$/), // Validate as MongoDB ObjectId string
  message: z.string(),
  isRead: z.boolean().default(false),
  type: z.enum(['assignment', 'status_change', 'comment', 'due_date']),
  createdAt: z.date().optional()
});

// Enhanced type that converts string IDs to ObjectId in the document
export type INotification = Omit<z.infer<typeof NotificationZodSchema>, 'userId' | 'taskId'> & {
    userId: mongoose.Types.ObjectId;
    taskId: mongoose.Types.ObjectId;
  } & Document;

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  type: { type: String, required: true }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

NotificationSchema.index({ userId: 1 });
NotificationSchema.index({ taskId: 1 });
NotificationSchema.index({ isRead: 1 });

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);