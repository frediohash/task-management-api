import dotenv from 'dotenv';
dotenv.config();

interface Config {
  server: {
    port: number;
    env: string;
  };
  mongo: {
    url: string;
  };
  jwt: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
  };
  redis: {
    url: string;
  };
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000'),
    env: process.env.NODE_ENV || 'development'
  },
  mongo: {
    url: process.env.MONGO_URL || 'mongodb://localhost:27017/task-manager'
  },
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'access-secret',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  }
};

export { config };