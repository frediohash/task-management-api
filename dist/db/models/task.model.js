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
exports.TaskModel = exports.TaskZodSchema = exports.TaskStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const zod_1 = require("zod");
exports.TaskStatus = ['pending', 'in_progress', 'completed', 'archived'];
exports.TaskZodSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(100),
    description: zod_1.z.string().max(1000).optional(),
    status: zod_1.z.enum(exports.TaskStatus).default('pending'),
    dueDate: zod_1.z.date().optional(),
    createdBy: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/), // Validate as MongoDB ObjectId string
    assignedTo: zod_1.z.array(zod_1.z.string()).optional(), // Array of User IDs
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional()
});
const TaskSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: exports.TaskStatus, default: 'pending' },
    dueDate: { type: Date },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});
TaskSchema.index({ title: 'text', description: 'text' });
TaskSchema.index({ status: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ createdBy: 1 });
TaskSchema.index({ assignedTo: 1 });
exports.TaskModel = mongoose_1.default.model('Task', TaskSchema);
