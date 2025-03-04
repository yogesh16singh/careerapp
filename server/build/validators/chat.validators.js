"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGroupChatNameValidator = exports.createAGroupChatValidator = void 0;
const express_validator_1 = require("express-validator");
const createAGroupChatValidator = () => {
    return [
        (0, express_validator_1.body)("name").trim().notEmpty().withMessage("Group name is required"),
        (0, express_validator_1.body)("participants")
            .isArray({
            min: 2,
            max: 100,
        })
            .withMessage("Participants must be an array with more than 2 members and less than 100 members"),
    ];
};
exports.createAGroupChatValidator = createAGroupChatValidator;
const updateGroupChatNameValidator = () => {
    return [(0, express_validator_1.body)("name").trim().notEmpty().withMessage("Group name is required")];
};
exports.updateGroupChatNameValidator = updateGroupChatNameValidator;
