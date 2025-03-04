"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotification = exports.sendNotification = exports.storePushToken = exports.getNotifications = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const node_cron_1 = __importDefault(require("node-cron"));
const user_model_1 = __importDefault(require("../models/user.model"));
const axios_1 = __importDefault(require("axios"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
// get all notification by admin
exports.getNotifications = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const userId = req?.user?._id; // Get logged-in user ID
        const notifications = await notification_model_1.default.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, notifications });
    }
    catch (error) {
        console.error("Error fetching notifications:", error);
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.storePushToken = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    const { token, userId } = req.body;
    await user_model_1.default.findByIdAndUpdate(req.user?._id, { pushToken: token });
    res.json({ success: true, message: "Token stored" });
});
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
/**
 * Send a push notification and store it in the database.
 * @param userId - The ID of the recipient user
 * @param expoPushToken - The user's Expo Push Token
 * @param title - Notification title
 * @param body - Notification message
 * @param data - Additional data (optional)
 */
const sendNotification = async (userId, expoPushToken, title, body, data) => {
    try {
        if (!expoPushToken) {
            console.error("Expo Push Token is missing");
            return;
        }
        // Send push notification
        const response = await axios_1.default.post(EXPO_PUSH_URL, {
            to: expoPushToken,
            title,
            body,
            sound: "default",
            data: data || {},
        });
        console.log("Expo Notification Response:", response.data);
        // Store the notification in the database
        const notification = new notification_model_1.default({
            userId,
            title,
            body,
            data,
        });
        await notification.save();
        console.log("Notification stored in DB");
    }
    catch (error) {
        console.error("Error sending notification:", error);
    }
};
exports.sendNotification = sendNotification;
// upate notification status by admin
exports.updateNotification = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const notification = await notification_model_1.default.findById(req.params.id);
        if (!notification) {
            return next(new ErrorHandler_1.default("Notification not found", 404));
        }
        else {
            notification.status
                ? (notification.status = "read")
                : notification?.status;
        }
        await notification.save();
        const notifications = await notification_model_1.default.find().sort({
            createdAt: -1,
        });
        res.status(201).json({
            success: true,
            notifications,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// delete notification --- only admin
node_cron_1.default.schedule("*/5 * * * * *", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await notification_model_1.default.deleteMany({
        status: "read",
        createAt: { $lt: thirtyDaysAgo },
    });
});
