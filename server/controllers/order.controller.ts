import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { IOrder } from "../models/order.model";
import userModel from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import CourseModel, { ICourse } from "../models/course.model";
import { getAllOrdersService, newOrder } from "../services/order.service";
import sendMail from "../utils/sendMail";
import path from "path";
import ejs from "ejs";
import NotificationModel from "../models/notification.model";
import { getAllCoursesService } from "../services/course.service";
import { redis } from "../utils/redis";
import Razorpay from "razorpay"
import crypto from "crypto"
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// create order
export const createOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, payment_info } = req.body as IOrder;

      if (payment_info) {
        if ("id" in payment_info) {
          const paymentIntentId = payment_info.id;
          const paymentIntent = await stripe.paymentIntents.retrieve(
            paymentIntentId
          );

          if (paymentIntent.status !== "succeeded") {
            return next(new ErrorHandler("Payment not authorized!", 400));
          }
        }
      }

      const user = await userModel.findById(req.user?._id);

      const courseExistsInUser = user?.courses.some(
        (course: any) => course._id.toString() === courseId
      );

      if (courseExistsInUser) {
        return next(
          new ErrorHandler("You have already purchased this course", 400)
        );
      }

      const course: ICourse | null = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const data: any = {
        courseId: course._id,
        userId: user?._id,
        payment_info,
      };

      const mailData = {
        order: {
          _id: course._id.toString().slice(0, 6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };

      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/order-confirmation.ejs"),
        { order: mailData }
      );

      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: "Order Confirmation",
            template: "order-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }

      user?.courses.push(course?._id);

      await redis.set(req.user?._id, JSON.stringify(user));

      await user?.save();

      await NotificationModel.create({
        user: user?._id,
        title: "New Order",
        message: `You have a new order from ${course?.name}`,
      });

      course.purchased += 1;

      await course.save();

      newOrder(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get all orders --- only for admin
export const getAllOrders = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllOrdersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// sent stripe publishie key
export const sendStripePublshableKey = CatchAsyncError(
  async (req: Request, res: Response) => {
    res.status(200).json({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  }
);

//ney payment
export const newPayment = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await stripe.customers.create(); // Create a new customer

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2023-10-16" } // Use the latest API version
    );
      const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "USD",
        metadata: {
          company: "E-Learning",
        },
        automatic_payment_methods: {
          enabled: true,
        }
      });
       console.log("myPayment", myPayment);
      res.status(200).json({
        success: true,
        client_secret: myPayment.client_secret,
        ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      });
    } catch (error: any) {
      console.error("error", error);
    }
  }
);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
export const createOrderRP = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, currency } = req.body;
      const options = {
        amount: amount * 100, // Amount in paisa (e.g., 50000 = ₹500)
        currency: currency || "INR",
        receipt: `receipt_${Math.random() * 1000}`,
      };
  
      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    } 
  }
)

export const verifyPayment = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { order_id, payment_id, signature } = req.body;
      const generated_signature = crypto
        .createHmac("sha256", "your_key_secret")
        .update(`${order_id}|${payment_id}`)
        .digest("hex");
    
      if (generated_signature === signature) {
        res.json({ success: true, message: "Payment Verified Successfully" });
      } else {
        res.status(400).json({ success: false, message: "Payment Verification Failed" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
)

export const updateUserPaymentStatus = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, counselorId } = req.body;
      // Add counselorId to user's purchasedCounselors array
      await userModel.findByIdAndUpdate(userId, {
        $addToSet: { purchasedCounselors: counselorId },
      });
  
      // Add userId to counselor's students array
      await userModel.findByIdAndUpdate(counselorId, {
        $addToSet: { students: userId },
      });

      const counselor = await userModel.findById(counselorId);
      if (counselor && counselor.pushToken) {
        const message = {
          to: counselor.pushToken,
          sound: "default",
          title: "New Booking!",
          body: "A student has booked a session with you. Check your dashboard.",
          data: { counselorId },
        };

        const response = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        });
      }

      await redis.del(userId)
      res.json({ message: "Payment data updated successfully!" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
)