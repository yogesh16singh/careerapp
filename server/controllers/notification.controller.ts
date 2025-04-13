import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cron from "node-cron";
import userModel from "../models/user.model";
import axios from "axios";
import NotificationModel from "../models/notification.model";
import { sendNotificationToKafka } from "../kafka/producer";

// get all notification by admin
export const getNotifications = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    const userId = req?.user?._id; // Get logged-in user ID
    const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 });

    res.json({ success: true, notifications });
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const storePushToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, userId } = req.body;
    await userModel.findByIdAndUpdate(req.user?._id, { pushToken: token });
    res.json({ success: true, message: "Token stored" });
  }
);


const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Send a push notification and store it in the database.
 * @param userId - The ID of the recipient user
 * @param expoPushToken - The user's Expo Push Token
 * @param title - Notification title
 * @param body - Notification message
 * @param data - Additional data (optional)
 */

export const sendNotification = async (userId: string, expoPushToken: string, title: string, body: string, data?: object) => {
  try {
    if (!expoPushToken) {
      console.error("Expo Push Token is missing");
      return;
    }
    //kafka producer
    // await sendNotificationToKafka({
    //   to: expoPushToken,
    //   title,
    //   body
    // });

    // Send push notification
    const response = await axios.post(EXPO_PUSH_URL, {
      to: expoPushToken,
      title,
      body,
      sound: "default",
      data: data || {},
    });

    console.log("Expo Notification Response:", response.data);

    // Store the notification in the database
    const notification = new NotificationModel({
      userId,
      title,
      body,
      data,
    });

    await notification.save();
    console.log("Notification stored in DB");

  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

// upate notification status by admin
export const updateNotification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await NotificationModel.findById(req.params.id);
      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      } else {
        notification.status
          ? (notification.status = "read")
          : notification?.status;
      }

      await notification.save();

      const notifications = await NotificationModel.find().sort({
        createdAt: -1,
      });

      res.status(201).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// delete notification --- only admin
cron.schedule("*/5 * * * * *", async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await NotificationModel.deleteMany({
    status: "read",
    createAt: { $lt: thirtyDaysAgo },
  });
});
