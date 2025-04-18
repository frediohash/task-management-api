"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitize = void 0;
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const sanitize = () => {
    return [
        // Sanitize request data
        (0, express_mongo_sanitize_1.default)(),
        // XSS protection
        (req, res, next) => {
            // Sanitize req.body
            if (req.body) {
                Object.keys(req.body).forEach(key => {
                    if (typeof req.body[key] === 'string') {
                        req.body[key] = req.body[key].replace(/<[^>]*>?/gm, '');
                    }
                });
            }
            // Sanitize req.query
            if (req.query) {
                Object.keys(req.query).forEach(key => {
                    if (typeof req.query[key] === 'string') {
                        req.query[key] = req.query[key].replace(/<[^>]*>?/gm, '');
                    }
                });
            }
            next();
        }
    ];
};
exports.sanitize = sanitize;
