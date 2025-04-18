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
exports.TaskHistoryModel = exports.TaskHistoryZodSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const zod_1 = require("zod");
exports.TaskHistoryZodSchema = zod_1.z.object({
    taskId: zod_1.z.instanceof(mongoose_1.default.Types.ObjectId).or(zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/)),
    changedBy: zod_1.z.instanceof(mongoose_1.default.Types.ObjectId).or(zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/)),
    changeType: zod_1.z.enum(['status_change', 'assignment', 'creation', 'deletion', 'update']),
    previousState: zod_1.z.any().optional(),
    newState: zod_1.z.any().optional(),
    changedAt: zod_1.z.date().optional()
});
const TaskHistorySchema = new mongoose_1.Schema({
    taskId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Task', required: true },
    changedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    changeType: { type: String, required: true },
    previousState: { type: mongoose_1.Schema.Types.Mixed },
    newState: { type: mongoose_1.Schema.Types.Mixed }
}, {
    timestamps: { createdAt: 'changedAt', updatedAt: false }
});
TaskHistorySchema.index({ taskId: 1 });
TaskHistorySchema.index({ changedBy: 1 });
TaskHistorySchema.index({ changeType: 1 });
exports.TaskHistoryModel = mongoose_1.default.model('TaskHistory', TaskHistorySchema);
