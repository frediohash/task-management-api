"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitize = exports.sanitizeMiddleware = void 0;
const mongo_sanitize_1 = __importDefault(require("mongo-sanitize"));
exports.sanitize = mongo_sanitize_1.default;
// Keep your deepSanitize function and export if needed
const deepSanitize = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return (0, mongo_sanitize_1.default)(obj);
    }
    return Object.keys(obj).reduce((acc, key) => {
        const cleanKey = (0, mongo_sanitize_1.default)(key);
        acc[cleanKey] = deepSanitize(obj[key]);
        return acc;
    }, Array.isArray(obj) ? [] : {});
};
// ✅ TEMP: Replace middleware with debug version
const sanitizeMiddleware = (req, res, next) => {
    try {
        console.log('🔥 Incoming request:', {
            bodyType: typeof req.body,
            queryType: typeof req.query,
            body: req.body,
            query: req.query,
            params: req.params
        });
        next();
    }
    catch (err) {
        console.error('🔥 Logging error:', err);
        res.status(500).json({ error: 'Logging failed' });
    }
};
exports.sanitizeMiddleware = sanitizeMiddleware;
