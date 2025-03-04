"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageValidator = void 0;
const express_validator_1 = require("express-validator");
const sendMessageValidator = () => {
    return [
        (0, express_validator_1.body)("content")
            .trim()
            .optional()
            .notEmpty()
            .withMessage("Content is required"),
    ];
};
exports.sendMessageValidator = sendMessageValidator;
