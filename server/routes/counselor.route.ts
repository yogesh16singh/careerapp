import express from "express"
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { getAllCounselors } from "../controllers/counselor.controller";
const counselorRouter = express.Router()

counselorRouter.get(
    "/get-counselors",
    getAllCounselors

)

export default counselorRouter
