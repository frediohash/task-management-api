"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskInteractions = exports.getTaskHistory = exports.getUserTasks = exports.deleteTask = exports.updateTask = exports.getTask = exports.createTask = void 0;
const task_model_1 = require("../db/models/task.model");
const taskHistory_model_1 = require("../db/models/taskHistory.model");
const taskComment_model_1 = require("../db/models/taskComment.model");
const userTask_model_1 = require("../db/models/userTask.model");
const notification_model_1 = require("../db/models/notification.model");
const task_model_2 = require("../db/models/task.model");
const ApiError_1 = require("../utils/ApiError");
const redis_1 = require("../config/redis");
const user_model_1 = require("../db/models/user.model");
const createTask = async (req, res, next) => {
    try {
        const validatedData = task_model_2.TaskZodSchema.parse(req.body);
        const task = new task_model_1.TaskModel({
            ...validatedData,
            createdBy: req.user.id
        });
        await task.save();
        // Create task history record
        await taskHistory_model_1.TaskHistoryModel.create({
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
            await userTask_model_1.UserTaskModel.insertMany(userTasks);
            // Create notifications for assigned users
            const notifications = validatedData.assignedTo.map(userId => ({
                userId,
                taskId: task._id,
                message: `You have been assigned to task: ${task.title}`,
                type: 'assignment'
            }));
            await notification_model_1.NotificationModel.insertMany(notifications);
        }
        res.status(201).json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.createTask = createTask;
const getTask = async (req, res, next) => {
    try {
        const task = await task_model_1.TaskModel.findById(req.params.id)
            .populate('createdBy', 'username email')
            .populate('assignedTo', 'username email');
        if (!task) {
            throw new ApiError_1.ApiError(404, 'Task not found');
        }
        // Check if user has access to this task
        const hasAccess = await userTask_model_1.UserTaskModel.exists({
            userId: req.user.id,
            taskId: req.params.id
        });
        if (req.user.role !== 'admin' && task.createdBy._id.toString() !== req.user.id && !hasAccess) {
            throw new ApiError_1.ApiError(403, 'Forbidden - No access to this task');
        }
        res.json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.getTask = getTask;
const updateTask = async (req, res, next) => {
    try {
        const task = await task_model_1.TaskModel.findById(req.params.id);
        if (!task) {
            throw new ApiError_1.ApiError(404, 'Task not found');
        }
        // Check permissions
        if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id) {
            throw new ApiError_1.ApiError(403, 'Forbidden - Only admin or task creator can update');
        }
        const previousState = task.toObject();
        const validatedData = task_model_2.TaskZodSchema.partial().parse(req.body);
        // Declare currentAssignments at the function scope
        const currentAssignments = task.assignedTo.map(id => id.toString());
        // Check for status change
        if (validatedData.status && validatedData.status !== task.status) {
            await taskHistory_model_1.TaskHistoryModel.create({
                taskId: task._id,
                changedBy: req.user.id,
                changeType: 'status_change',
                previousState: { status: task.status },
                newState: { status: validatedData.status }
            });
            // Create notifications for assigned users
            const assignedUsers = await userTask_model_1.UserTaskModel.find({ taskId: task._id });
            const notifications = assignedUsers.map(userTask => ({
                userId: userTask.userId,
                taskId: task._id,
                message: `Task status changed from ${task.status} to ${validatedData.status} for task: ${task.title}`,
                type: 'status_change'
            }));
            await notification_model_1.NotificationModel.insertMany(notifications);
        }
        // Check for assignment changes
        if (validatedData.assignedTo) {
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
                await userTask_model_1.UserTaskModel.insertMany(userTasks);
                const notifications = added.map(userId => ({
                    userId,
                    taskId: task._id,
                    message: `You have been assigned to task: ${task.title}`,
                    type: 'assignment'
                }));
                await notification_model_1.NotificationModel.insertMany(notifications);
            }
            // Remove assignments
            if (removed.length > 0) {
                await userTask_model_1.UserTaskModel.deleteMany({
                    userId: { $in: removed },
                    taskId: task._id
                });
                const notifications = removed.map(userId => ({
                    userId,
                    taskId: task._id,
                    message: `You have been unassigned from task: ${task.title}`,
                    type: 'assignment'
                }));
                await notification_model_1.NotificationModel.insertMany(notifications);
            }
        }
        Object.assign(task, validatedData);
        await task.save();
        // Invalidate cache for user tasks
        if (validatedData.assignedTo) {
            for (const userId of [...currentAssignments, ...validatedData.assignedTo]) {
                await redis_1.redisClient.del(`user_tasks:${userId}`);
            }
        }
        res.json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res, next) => {
    try {
        const task = await task_model_1.TaskModel.findById(req.params.id);
        if (!task) {
            throw new ApiError_1.ApiError(404, 'Task not found');
        }
        // Check permissions
        if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id) {
            throw new ApiError_1.ApiError(403, 'Forbidden - Only admin or task creator can delete');
        }
        // Create task history record
        await taskHistory_model_1.TaskHistoryModel.create({
            taskId: task._id,
            changedBy: req.user.id,
            changeType: 'deletion',
            previousState: task.toObject()
        });
        // Delete related records
        await Promise.all([
            taskComment_model_1.TaskCommentModel.deleteMany({ taskId: task._id }),
            userTask_model_1.UserTaskModel.deleteMany({ taskId: task._id }),
            notification_model_1.NotificationModel.deleteMany({ taskId: task._id }),
            taskHistory_model_1.TaskHistoryModel.deleteMany({ taskId: task._id }),
            task.deleteOne()
        ]);
        // Invalidate cache for assigned users
        const assignedUsers = await userTask_model_1.UserTaskModel.find({ taskId: task._id });
        for (const userTask of assignedUsers) {
            await redis_1.redisClient.del(`user_tasks:${userTask.userId}`);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTask = deleteTask;
const getUserTasks = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10, status, dueDateBefore, dueDateAfter, search } = req.query;
        // Check if requesting own tasks or has permission
        if (id !== req.user.id && req.user.role !== 'admin') {
            throw new ApiError_1.ApiError(403, 'Forbidden - Can only view own tasks');
        }
        const cacheKey = `user_tasks:${id}:${page}:${limit}:${status}:${dueDateBefore}:${dueDateAfter}:${search}`;
        const cachedData = await redis_1.redisClient.get(cacheKey);
        if (cachedData) {
            return res.json(JSON.parse(cachedData));
        }
        const query = { userId: id };
        if (status)
            query.status = status;
        if (dueDateBefore || dueDateAfter) {
            query.dueDate = {};
            if (dueDateBefore)
                query.dueDate.$lte = new Date(dueDateBefore);
            if (dueDateAfter)
                query.dueDate.$gte = new Date(dueDateAfter);
        }
        const aggregationPipeline = [
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
            userTask_model_1.UserTaskModel.aggregate(aggregationPipeline)
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit)),
            userTask_model_1.UserTaskModel.countDocuments(query)
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
        await redis_1.redisClient.set(cacheKey, JSON.stringify(result), 'EX', 300);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getUserTasks = getUserTasks;
const getTaskHistory = async (req, res, next) => {
    try {
        const taskId = req.params.id;
        // Check if user has access to this task
        const hasAccess = await userTask_model_1.UserTaskModel.exists({
            userId: req.user.id,
            taskId
        });
        const task = await task_model_1.TaskModel.findById(taskId);
        if (!task) {
            throw new ApiError_1.ApiError(404, 'Task not found');
        }
        if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id && !hasAccess) {
            throw new ApiError_1.ApiError(403, 'Forbidden - No access to this task');
        }
        const history = await taskHistory_model_1.TaskHistoryModel.find({ taskId })
            .populate('changedBy', 'username email')
            .sort({ changedAt: -1 });
        res.json(history);
    }
    catch (error) {
        next(error);
    }
};
exports.getTaskHistory = getTaskHistory;
const getTaskInteractions = async (req, res, next) => {
    try {
        const taskId = req.params.id;
        // Check if user has access to this task
        const hasAccess = await userTask_model_1.UserTaskModel.exists({
            userId: req.user.id,
            taskId
        });
        const task = await task_model_1.TaskModel.findById(taskId);
        if (!task) {
            throw new ApiError_1.ApiError(404, 'Task not found');
        }
        if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id && !hasAccess) {
            throw new ApiError_1.ApiError(403, 'Forbidden - No access to this task');
        }
        const [commenters, historyUsers, assignedUsers] = await Promise.all([
            taskComment_model_1.TaskCommentModel.distinct('userId', { taskId }),
            taskHistory_model_1.TaskHistoryModel.distinct('changedBy', { taskId }),
            userTask_model_1.UserTaskModel.distinct('userId', { taskId })
        ]);
        const allUserIds = [...new Set([...commenters, ...historyUsers, ...assignedUsers])];
        const users = await user_model_1.UserModel.find({ _id: { $in: allUserIds } }, 'username email role');
        res.json(users);
    }
    catch (error) {
        next(error);
    }
};
exports.getTaskInteractions = getTaskInteractions;
