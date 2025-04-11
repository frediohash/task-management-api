import { Request, Response, NextFunction } from 'express';
import { TaskModel } from '../db/models/task.model';
import { TaskHistoryModel } from '../db/models/taskHistory.model';
import { TaskCommentModel } from '../db/models/taskComment.model';
import { UserTaskModel } from '../db/models/userTask.model';
import { NotificationModel } from '../db/models/notification.model';
import { TaskZodSchema } from '../db/models/task.model';
import { ApiError } from '../utils/ApiError';
import { redisClient } from '../config/redis';

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = TaskZodSchema.parse(req.body);
    const task = new TaskModel({
      ...validatedData,
      createdBy: req.user.id
    });

    await task.save();

    // Create task history record
    await TaskHistoryModel.create({
      taskId: task._id,
      changedBy: req.user.id,
      changeType: 'creation',
      newState: task.toObject()
    });

    // If assignedTo is provided, create user-task relationships
    if (validatedData.assignedTo && validatedData.assignedTo.length > 0) {
      const userTasks = validatedData.assignedTo.map(userId => ({
        userId,
        taskId: task._id,
        role: 'assignee'
      }));

      await UserTaskModel.insertMany(userTasks);

      // Create notifications for assigned users
      const notifications = validatedData.assignedTo.map(userId => ({
        userId,
        taskId: task._id,
        message: `You have been assigned to task: ${task.title}`,
        type: 'assignment'
      }));

      await NotificationModel.insertMany(notifications);
    }

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await TaskModel.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('assignedTo', 'username email');

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    // Check if user has access to this task
    const hasAccess = await UserTaskModel.exists({
      userId: req.user.id,
      taskId: req.params.id
    });

    if (req.user.role !== 'admin' && task.createdBy._id.toString() !== req.user.id && !hasAccess) {
      throw new ApiError(403, 'Forbidden - No access to this task');
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    // Check permissions
    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id) {
      throw new ApiError(403, 'Forbidden - Only admin or task creator can update');
    }

    const previousState = task.toObject();
    const validatedData = TaskZodSchema.partial().parse(req.body);

    // Check for status change
    if (validatedData.status && validatedData.status !== task.status) {
      await TaskHistoryModel.create({
        taskId: task._id,
        changedBy: req.user.id,
        changeType: 'status_change',
        previousState: { status: task.status },
        newState: { status: validatedData.status }
      });

      // Create notifications for assigned users
      const assignedUsers = await UserTaskModel.find({ taskId: task._id });
      const notifications = assignedUsers.map(userTask => ({
        userId: userTask.userId,
        taskId: task._id,
        message: `Task status changed from ${task.status} to ${validatedData.status} for task: ${task.title}`,
        type: 'status_change'
      }));

      await NotificationModel.insertMany(notifications);
    }

    // Check for assignment changes
    if (validatedData.assignedTo) {
      const currentAssignments = task.assignedTo.map(id => id.toString());
      const newAssignments = validatedData.assignedTo;

      const added = newAssignments.filter(id => !currentAssignments.includes(id));
      const removed = currentAssignments.filter(id => !newAssignments.includes(id));

      // Add new assignments
      if (added.length > 0) {
        const userTasks = added.map(userId => ({
          userId,
          taskId: task._id,
          role: 'assignee'
        }));

        await UserTaskModel.insertMany(userTasks);

        const notifications = added.map(userId => ({
          userId,
          taskId: task._id,
          message: `You have been assigned to task: ${task.title}`,
          type: 'assignment'
        }));

        await NotificationModel.insertMany(notifications);
      }

      // Remove assignments
      if (removed.length > 0) {
        await UserTaskModel.deleteMany({
          userId: { $in: removed },
          taskId: task._id
        });

        const notifications = removed.map(userId => ({
          userId,
          taskId: task._id,
          message: `You have been unassigned from task: ${task.title}`,
          type: 'assignment'
        }));

        await NotificationModel.insertMany(notifications);
      }
    }

    Object.assign(task, validatedData);
    await task.save();

    // Invalidate cache for user tasks
    if (validatedData.assignedTo) {
      for (const userId of [...currentAssignments, ...validatedData.assignedTo]) {
        await redisClient.del(`user_tasks:${userId}`);
      }
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    // Check permissions
    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id) {
      throw new ApiError(403, 'Forbidden - Only admin or task creator can delete');
    }

    // Create task history record
    await TaskHistoryModel.create({
      taskId: task._id,
      changedBy: req.user.id,
      changeType: 'deletion',
      previousState: task.toObject()
    });

    // Delete related records
    await Promise.all([
      TaskCommentModel.deleteMany({ taskId: task._id }),
      UserTaskModel.deleteMany({ taskId: task._id }),
      NotificationModel.deleteMany({ taskId: task._id }),
      TaskHistoryModel.deleteMany({ taskId: task._id }),
      task.deleteOne()
    ]);

    // Invalidate cache for assigned users
    const assignedUsers = await UserTaskModel.find({ taskId: task._id });
    for (const userTask of assignedUsers) {
      await redisClient.del(`user_tasks:${userTask.userId}`);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getUserTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status, dueDateBefore, dueDateAfter, search } = req.query;

    // Check if requesting own tasks or has permission
    if (id !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Forbidden - Can only view own tasks');
    }

    const cacheKey = `user_tasks:${id}:${page}:${limit}:${status}:${dueDateBefore}:${dueDateAfter}:${search}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const query: any = { userId: id };
    if (status) query.status = status;

    if (dueDateBefore || dueDateAfter) {
      query.dueDate = {};
      if (dueDateBefore) query.dueDate.$lte = new Date(dueDateBefore as string);
      if (dueDateAfter) query.dueDate.$gte = new Date(dueDateAfter as string);
    }

    const aggregationPipeline: any[] = [
      { $match: query },
      { $lookup: {
          from: 'tasks',
          localField: 'taskId',
          foreignField: '_id',
          as: 'task'
        }
      },
      { $unwind: '$task' }
    ];

    if (search) {
      aggregationPipeline.push({
        $match: {
          $or: [
            { 'task.title': { $regex: search, $options: 'i' } },
            { 'task.description': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    const [tasks, total] = await Promise.all([
      UserTaskModel.aggregate(aggregationPipeline)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      UserTaskModel.countDocuments(query)
    ]);

    const result = {
      tasks: tasks.map(t => t.task),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };

    // Cache for 5 minutes
    await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 300);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getTaskHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = req.params.id;

    // Check if user has access to this task
    const hasAccess = await UserTaskModel.exists({
      userId: req.user.id,
      taskId
    });

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id && !hasAccess) {
      throw new ApiError(403, 'Forbidden - No access to this task');
    }

    const history = await TaskHistoryModel.find({ taskId })
      .populate('changedBy', 'username email')
      .sort({ changedAt: -1 });

    res.json(history);
  } catch (error) {
    next(error);
  }
};

export const getTaskInteractions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = req.params.id;

    // Check if user has access to this task
    const hasAccess = await UserTaskModel.exists({
      userId: req.user.id,
      taskId
    });

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id && !hasAccess) {
      throw new ApiError(403, 'Forbidden - No access to this task');
    }

    const [commenters, historyUsers, assignedUsers] = await Promise.all([
      TaskCommentModel.distinct('userId', { taskId }),
      TaskHistoryModel.distinct('changedBy', { taskId }),
      UserTaskModel.distinct('userId', { taskId })
    ]);

    const allUserIds = [...new Set([...commenters, ...historyUsers, ...assignedUsers])];
    const users = await UserModel.find({ _id: { $in: allUserIds } }, 'username email role');

    res.json(users);
  } catch (error) {
    next(error);
  }
};