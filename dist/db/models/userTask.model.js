"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTaskModel = exports.UserTaskZodSchema = void 0;
// (Many-to-Many)
const mongoose_1 = __importStar(require("mongoose"));
const zod_1 = require("zod");
exports.UserTaskZodSchema = zod_1.z.object({
    userId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/), // Validate as MongoDB ObjectId string
    taskId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/), // Validate as MongoDB ObjectId string
    role: zod_1.z.enum(['assignee', 'reviewer', 'watcher']).default('assignee'),
    assignedAt: zod_1.z.date().optional()
});
const UserTaskSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Task', required: true },
    role: { type: String, enum: ['assignee', 'reviewer', 'watcher'], default: 'assignee' }
}, {
    timestamps: { createdAt: 'assignedAt', updatedAt: false }
});
// Compound index to ensure unique user-task combinations
UserTaskSchema.index({ userId: 1, taskId: 1 }, { unique: true });
UserTaskSchema.index({ taskId: 1 });
UserTaskSchema.index({ role: 1 });
exports.UserTaskModel = mongoose_1.default.model('UserTask', UserTaskSchema);
