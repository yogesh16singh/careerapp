"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const ai_controllers_1 = require("../controllers/ai.controllers");
const aiRouter = express_1.default.Router();
aiRouter.post('/career-suggestion-ai', auth_1.isAuthenticated, ai_controllers_1.submitOptionsToAI);
aiRouter.get('/ai-chat-history', auth_1.isAuthenticated, ai_controllers_1.getAIChatHistory);
aiRouter.post('/continue-chat', auth_1.isAuthenticated, ai_controllers_1.continueAIChat);
exports.default = aiRouter;
