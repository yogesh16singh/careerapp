"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
/**
 * @description This is the validate middleware responsible for centralizing error checking done by `express-validator`.
 * It checks if the request validation has errors.
 * If errors exist, it structures them and throws an `ApiError` which forwards the error to the global error handler.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().forEach((err) => {
        if ('path' in err) {
            extractedErrors.push({ [err.path]: err.msg });
        }
        else {
            // Handle the case where the error object doesn't have a 'path' property
            // For example, you could push a default error message or log a warning
            extractedErrors.push({ error: 'Unknown error' });
        }
    });
    return next(new ErrorHandler_1.default("Received data is not valid", 422));
    //   throw new ApiError(422, "Received data is not valid", extractedErrors);
};
exports.validate = validate;
