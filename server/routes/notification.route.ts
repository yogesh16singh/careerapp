import express from "express"
import { authorizeRoles, isAuthenticated } from "../middleware/auth"
import { getNotifications, storePushToken, updateNotification } from "../controllers/notification.controller"
import { updateAccessToken } from "../controllers/user.controller"

const notificationRoute = express.Router()

notificationRoute.get("/get-notifications", isAuthenticated, getNotifications)
notificationRoute.put("/update-notification/:id", updateAccessToken, isAuthenticated, authorizeRoles("admin"), updateNotification)
notificationRoute.post("/store-push-token", isAuthenticated, storePushToken)

export default notificationRoute