"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitize = exports.sanitizeMiddleware = void 0;
const mongo_sanitize_1 = __importDefault(require("mongo-sanitize"));
exports.sanitize = mongo_sanitize_1.default;
const deepSanitize = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return (0, mongo_sanitize_1.default)(obj);
    }
    return Object.keys(obj).reduce((acc, key) => {
        acc[(0, mongo_sanitize_1.default)(key)] = deepSanitize(obj[key]);
        return acc;
    }, Array.isArray(obj) ? [] : {});
};
const sanitizeMiddleware = (req, res, next) => {
    try {
        if (req.body)
            req.body = deepSanitize(req.body);
        if (req.query)
            req.query = deepSanitize(req.query);
        if (req.params)
            req.params = deepSanitize(req.params);
        next();
    }
    catch (error) {
        res.status(500).json({ error: 'Sanitization failed' });
    }
};
exports.sanitizeMiddleware = sanitizeMiddleware;
