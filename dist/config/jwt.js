"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
// Helper function to validate and format expiresIn
const getExpiresIn = (expiry) => {
    // If it's a number string (e.g., "3600"), convert to number
    if (/^\d+$/.test(expiry)) {
        return parseInt(expiry, 10);
    }
    // Otherwise keep as string (e.g., "15m", "1h")
    return expiry;
};
const generateAccessToken = (userId, role) => {
    const payload = { userId, role };
    const options = {
        expiresIn: getExpiresIn(config_1.config.jwt.accessTokenExpiry),
        algorithm: 'HS256'
    };
    return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.accessTokenSecret, options);
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId) => {
    const payload = { userId };
    const options = {
        expiresIn: getExpiresIn(config_1.config.jwt.accessTokenExpiry),
        algorithm: 'HS256'
    };
    return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.refreshTokenSecret, options);
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.config.jwt.accessTokenSecret);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.config.jwt.refreshTokenSecret);
};
exports.verifyRefreshToken = verifyRefreshToken;
