"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const counselor_controller_1 = require("../controllers/counselor.controller");
const counselorRouter = express_1.default.Router();
counselorRouter.get("/get-counselors", counselor_controller_1.getAllCounselors);
exports.default = counselorRouter;
