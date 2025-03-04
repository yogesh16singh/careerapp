import express from "express"
import { authorizeRoles, isAuthenticated } from "../middleware/auth"
import { continueAIChat, getAIChatHistory, submitOptionsToAI } from "../controllers/ai.controllers"
const aiRouter = express.Router()

aiRouter.post('/career-suggestion-ai', isAuthenticated, submitOptionsToAI)
aiRouter.get('/ai-chat-history', isAuthenticated, getAIChatHistory)
aiRouter.post('/continue-chat', isAuthenticated, continueAIChat)



export default aiRouter 