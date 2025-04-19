"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.login = exports.register = void 0;
const user_model_1 = require("../db/models/user.model");
const ApiError_1 = require("../utils/ApiError");
const jwt_1 = require("../config/jwt");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const register = async (req, res, next) => {
    try {
        console.log('🔐 [REGISTER] request received:', req.body);
        const { username, email, password, role } = req.body;
        console.log('Registering:', req.body);
        const existingUser = await user_model_1.UserModel.findOne({ email });
        if (existingUser) {
            throw new ApiError_1.ApiError(400, 'Email already in use');
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await user_model_1.UserModel.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'user'
        });
        res.status(201).json({
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await user_model_1.UserModel.findOne({ email });
        if (!user) {
            throw new ApiError_1.ApiError(401, 'Invalid credentials');
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            throw new ApiError_1.ApiError(401, 'Invalid credentials');
        }
        const accessToken = (0, jwt_1.generateAccessToken)(user._id.toString(), user.role);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user._id.toString());
        user.refreshToken = refreshToken;
        await user.save();
        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new ApiError_1.ApiError(401, 'Refresh token required');
        }
        const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const user = await user_model_1.UserModel.findById(decoded.userId);
        if (!user || user.refreshToken !== refreshToken) {
            throw new ApiError_1.ApiError(401, 'Invalid refresh token');
        }
        const newAccessToken = (0, jwt_1.generateAccessToken)(user._id.toString(), user.role);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(user._id.toString());
        user.refreshToken = newRefreshToken;
        await user.save();
        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    }
    catch (error) {
        next(error);
    }
};
exports.refreshToken = refreshToken;
