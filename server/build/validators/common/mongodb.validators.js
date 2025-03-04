"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoIdRequestBodyValidator = exports.mongoIdPathVariableValidator = void 0;
const express_validator_1 = require("express-validator");
/**
 *
 * @param {string} idName
 * @description A common validator responsible to validate mongodb ids passed in the url's path variable
 */
const mongoIdPathVariableValidator = (idName) => {
    return [
        (0, express_validator_1.param)(idName).notEmpty().isMongoId().withMessage(`Invalid ${idName}`),
    ];
};
exports.mongoIdPathVariableValidator = mongoIdPathVariableValidator;
/**
 *
 * @param {string} idName
 * @description A common validator responsible to validate mongodb ids passed in the request body
 */
const mongoIdRequestBodyValidator = (idName) => {
    return [(0, express_validator_1.body)(idName).notEmpty().isMongoId().withMessage(`Invalid ${idName}`)];
};
exports.mongoIdRequestBodyValidator = mongoIdRequestBodyValidator;
