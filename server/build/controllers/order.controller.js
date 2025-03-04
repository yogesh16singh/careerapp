"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserPaymentStatus = exports.verifyPayment = exports.createOrderRP = exports.newPayment = exports.sendStripePublshableKey = exports.getAllOrders = exports.createOrder = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const user_model_1 = __importDefault(require("../models/user.model"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const course_model_1 = __importDefault(require("../models/course.model"));
const order_service_1 = require("../services/order.service");
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const redis_1 = require("../utils/redis");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const notification_controller_1 = require("./notification.controller");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// create order
exports.createOrder = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { courseId, payment_info } = req.body;
        if (payment_info) {
            if ("id" in payment_info) {
                const paymentIntentId = payment_info.id;
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
                if (paymentIntent.status !== "succeeded") {
                    return next(new ErrorHandler_1.default("Payment not authorized!", 400));
                }
            }
        }
        const user = await user_model_1.default.findById(req.user?._id);
        const courseExistsInUser = user?.courses.some((course) => course._id.toString() === courseId);
        if (courseExistsInUser) {
            return next(new ErrorHandler_1.default("You have already purchased this course", 400));
        }
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new ErrorHandler_1.default("Course not found", 404));
        }
        const data = {
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
        const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/order-confirmation.ejs"), { order: mailData });
        try {
            if (user) {
                await (0, sendMail_1.default)({
                    email: user.email,
                    subject: "Order Confirmation",
                    template: "order-confirmation.ejs",
                    data: mailData,
                });
            }
        }
        catch (error) {
            return next(new ErrorHandler_1.default(error.message, 500));
        }
        user?.courses.push(course?._id);
        await redis_1.redis.set(req.user?._id, JSON.stringify(user));
        await user?.save();
        await notification_model_1.default.create({
            user: user?._id,
            title: "New Order",
            message: `You have a new order from ${course?.name}`,
        });
        course.purchased += 1;
        await course.save();
        (0, order_service_1.newOrder)(data, res, next);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get all orders --- only for admin
exports.getAllOrders = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        (0, order_service_1.getAllOrdersService)(res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// sent stripe publishie key
exports.sendStripePublshableKey = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res) => {
    res.status(200).json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});
//ney payment
exports.newPayment = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const customer = await stripe.customers.create(); // Create a new customer
        const ephemeralKey = await stripe.ephemeralKeys.create({ customer: customer.id }, { apiVersion: "2023-10-16" } // Use the latest API version
        );
        const myPayment = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: "USD",
            metadata: {
                company: "E-Learning",
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });
        console.log("myPayment", myPayment);
        res.status(200).json({
            success: true,
            client_secret: myPayment.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
        });
    }
    catch (error) {
        console.error("error", error);
    }
});
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
exports.createOrderRP = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { amount, currency } = req.body;
        const options = {
            amount: amount * 100, // Amount in paisa (e.g., 50000 = ₹500)
            currency: currency || "INR",
            receipt: `receipt_${Math.random() * 1000}`,
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.verifyPayment = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { order_id, payment_id, signature } = req.body;
        const generated_signature = crypto_1.default
            .createHmac("sha256", "your_key_secret")
            .update(`${order_id}|${payment_id}`)
            .digest("hex");
        if (generated_signature === signature) {
            res.json({ success: true, message: "Payment Verified Successfully" });
        }
        else {
            res
                .status(400)
                .json({ success: false, message: "Payment Verification Failed" });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateUserPaymentStatus = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { userId, counselorId } = req.body;
        await redis_1.redis.del(userId);
        // Add counselorId to user's purchasedCounselors array
        await user_model_1.default.findByIdAndUpdate(userId, {
            $addToSet: { purchasedCounselors: counselorId },
        });
        // Add userId to counselor's students array
        await user_model_1.default.findByIdAndUpdate(counselorId, {
            $addToSet: { students: userId },
        });
        const counselor = await user_model_1.default.findById(counselorId);
        if (counselor && counselor.pushToken) {
            await (0, notification_controller_1.sendNotification)(counselor._id, counselor.pushToken, "New Booking", "A new student has booked your session!");
        }
        res.json({ message: "Payment data updated successfully!" });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
