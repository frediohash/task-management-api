"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
// src/middleware/rateLimit.ts
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rateLimiter = (minutes, message, maxRequests = 100) => {
    return (0, express_rate_limit_1.default)({
        windowMs: minutes * 60 * 1000,
        max: maxRequests,
        message,
    });
};
exports.rateLimiter = rateLimiter;
