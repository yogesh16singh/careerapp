"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCounselors = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const redis_1 = require("../utils/redis");
const user_model_1 = __importDefault(require("../models/user.model"));
exports.getAllCounselors = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    console.log("Get all counselors");
    try {
        // Check if counselors are cached in Redis
        // const isCacheExist = await redis.get("allCounselors");
        // if (isCacheExist) {
        //   const counselors = JSON.parse(isCacheExist);
        //   return res.status(200).json({
        //     success: true,
        //     counselors,
        //   });
        // }
        // Fetch counselors from the database
        const counselors = await user_model_1.default
            .find({ role: "counselor" })
            .select("name email role expertise experience availability avatar");
        // Cache the result in Redis
        await redis_1.redis.set("allCounselors", JSON.stringify(counselors), "EX", 3600); // Cache for 1 hour
        res.status(200).json({
            success: true,
            counselors,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
