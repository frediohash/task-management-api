"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../config/jwt");
const user_model_1 = require("../db/models/user.model");
const ApiError_1 = require("../utils/ApiError");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError_1.ApiError(401, 'Unauthorized - No token provided');
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        const user = await user_model_1.UserModel.findById(decoded.userId);
        if (!user) {
            throw new ApiError_1.ApiError(401, 'Unauthorized - User not found');
        }
        req.user = {
            id: user._id.toString(),
            role: user.role
        };
        next();
    }
    catch (error) {
        next(new ApiError_1.ApiError(401, 'Unauthorized - Invalid token'));
    }
};
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ApiError_1.ApiError(403, 'Forbidden - Insufficient permissions'));
        }
        next();
    };
};
exports.authorize = authorize;
