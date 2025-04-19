import dotenv from 'dotenv';
import Redis from 'ioredis';
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
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'super_secret_key_123',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'another_secret_key_456',
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '1h',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://default:SECgeJUcRtERdRuPt2WiL05gr5YHkKEH@redis-10964.c38599.ap-seast-3-mz.ec2.cloud.rlrcp.com:10964'
  }
};

export { config };