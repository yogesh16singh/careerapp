import express from "express"
import { authorizeRoles, isAuthenticated } from "../middleware/auth"
import { submitOptionsToAI } from "../controllers/ai.controllers"
const aiRouter = express.Router()

aiRouter.post('/career-suggestion-ai', isAuthenticated, submitOptionsToAI)
export default aiRouter 