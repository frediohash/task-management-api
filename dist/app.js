"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const ApiError_1 = require("./utils/ApiError");
const redis_1 = require("./config/redis");
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const sanitize_1 = require("./middleware/sanitize");
const config_1 = require("./config/config");
const cors_2 = require("./middleware/cors");
const app = (0, express_1.default)();
// Connect to MongoDB
mongoose_1.default.connect(config_1.config.mongo.url)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
// Connect to Redis
redis_1.redisClient.on('connect', () => console.log('Connected to Redis'));
redis_1.redisClient.on('error', err => console.error('Redis error:', err));
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(sanitize_1.sanitizeMiddleware);
// Add before routes
app.use((req, res, next) => {
    req.setTimeout(10000); // 10 seconds
    res.setTimeout(10000);
    next();
});
app.use(cors_2.corsMiddleware);
// Routes
app.use('/api/v1/tasks', task_routes_1.default);
app.use('/api/v1/auth', auth_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        mongo: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected',
        redis: redis_1.redisClient.status === 'ready' ? 'connected' : 'disconnected'
    });
});
// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
});
// Error handler
app.use(ApiError_1.errorHandler);
exports.default = app;
