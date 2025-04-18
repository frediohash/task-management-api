"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskWorker = exports.taskQueue = exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const bullmq_1 = require("bullmq");
const config_1 = require("./config");
// Create Redis connection with proper BullMQ settings
exports.redisClient = new ioredis_1.default(config_1.config.redis.url, {
    maxRetriesPerRequest: null, // This is the critical fix
    enableReadyCheck: false
});
// BullMQ Queue setup
exports.taskQueue = new bullmq_1.Queue('task-queue', {
    connection: exports.redisClient,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        }
    }
});
// Worker setup
exports.taskWorker = new bullmq_1.Worker('task-queue', async (job) => {
    switch (job.name) {
        case 'send-notification':
            console.log('Processing notification:', job.data);
            break;
        default:
            console.log('Processing job:', job.name);
    }
}, { connection: exports.redisClient });
// Graceful shutdown
process.on('SIGTERM', async () => {
    await exports.taskWorker.close();
    await exports.taskQueue.close();
    await exports.redisClient.quit();
});
