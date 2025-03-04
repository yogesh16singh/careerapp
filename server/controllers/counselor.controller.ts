import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse, getAllCoursesService } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";
import axios from "axios";
import userModel from "../models/user.model";


export const getAllCounselors = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
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
        const counselors = await userModel
          .find({ role: "counselor" })
          .select("name email role expertise experience availability avatar");
  
        // Cache the result in Redis
        await redis.set("allCounselors", JSON.stringify(counselors), "EX", 3600); // Cache for 1 hour
        
        res.status(200).json({
          success: true,
          counselors,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );
  
  