"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const task_controller_1 = require("../controllers/task.controller");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const catchAsync_1 = require("../utils/catchAsync");
const router = express_1.default.Router();
// Apply rate limiting to all task routes
router.use((0, rateLimit_1.rateLimiter)(15, 'Too many requests, try again later', 10));
// Task CRUD routes
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'manager']), task_controller_1.createTask);
router.get('/:id', auth_1.authenticate, task_controller_1.getTask);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'manager']), task_controller_1.updateTask);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'manager']), task_controller_1.deleteTask);
// User tasks with pagination and filtering
router.get('/user/:id', auth_1.authenticate, (0, catchAsync_1.catchAsync)(task_controller_1.getUserTasks));
// Task history and interactions
router.get('/:id/history', auth_1.authenticate, task_controller_1.getTaskHistory);
router.get('/:id/interactions', auth_1.authenticate, task_controller_1.getTaskInteractions);
exports.default = router;
