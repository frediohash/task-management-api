"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
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
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
};
exports.config = config;
