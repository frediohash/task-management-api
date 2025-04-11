import Redis from 'ioredis';
import { config } from './config';

export const redisClient = new Redis(config.redis.url);

// BullMQ queue for background jobs
import { Queue } from 'bullmq';
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

// Worker for processing jobs
import { Worker } from 'bullmq';
export const taskWorker = new Worker('task-queue', async job => {
  switch (job.name) {
    case 'send-notification':
      // In a real app, this would send an email or push notification
      console.log('Sending notification:', job.data);
      break;
    case 'cleanup-task':
      console.log('Cleaning up task:', job.data);
      break;
    default:
      console.log('Processing unknown job:', job.name);
  }
}, { connection: redisClient });

// Graceful shutdown
process.on('SIGTERM', async () => {
  await taskWorker.close();
  await taskQueue.close();
  await redisClient.quit();
});