import Redis from 'ioredis';
import { Queue, Worker } from 'bullmq';
import { config } from './config';

// Create Redis connection with proper BullMQ settings
export const redisClient = new Redis(config.redis.url, {
  maxRetriesPerRequest: null, // This is the critical fix
  enableReadyCheck: false
});

// BullMQ Queue setup
export const taskQueue = new Queue('task-queue', {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});

// Worker setup
export const taskWorker = new Worker('task-queue', async job => {
  switch (job.name) {
    case 'send-notification':
      console.log('Processing notification:', job.data);
      break;
    default:
      console.log('Processing job:', job.name);
  }
}, { connection: redisClient });

// Graceful shutdown
process.on('SIGTERM', async () => {
  await taskWorker.close();
  await taskQueue.close();
  await redisClient.quit();
});