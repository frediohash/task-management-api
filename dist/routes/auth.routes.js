"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const rateLimit_1 = require("../middleware/rateLimit");
const router = express_1.default.Router();
// Apply stricter rate limiting to auth routes
router.use((0, rateLimit_1.rateLimiter)(15, 'Too many requests from this IP, please try again after 15 minutes'));
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/refresh-token', auth_controller_1.refreshToken);
exports.default = router;
