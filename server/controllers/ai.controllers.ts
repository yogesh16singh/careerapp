require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import { OpenAI } from "openai";

import { GoogleGenerativeAI } from "@google/generative-ai";
import userModel, { IUser } from "../models/user.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { redis } from "../utils/redis";
import {
  getAllUsersService,
  getUserById,
  updatetUserRoleService,
} from "../services/user.service";
import cloudinary from "cloudinary";
import aiChatHistoryModel from "../models/aiChatHistory.model";

// Initialize Google Gemini API
const genAI = new GoogleGenerativeAI("AIzaSyBXiwmvEs_Pt-LNJ14wHNDcFnLskcsrTqU");

export const submitOptionsToAI = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answers } = req.body;
      const userId = req?.user?._id; 
      console.log("User Answers:", answers);
      // Format the answers into a prompt for OpenAI
      const prompt = `
            Based on the following answers:
            1. What interests you the most? ${answers["1"]}
            2. What are your key strengths? ${answers["2"]}
            3. Preferred work environment? ${answers["3"]}
            4. How do you prefer to work? ${answers["4"]}
            5. What matters most to you? ${answers["5"]}
            6. What is your educational background? ${answers["6"]}
            
            Please suggest a career path that aligns with these preferences.
        `;

      // Call Google Gemini AI
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text();
      console.log("AI Response:", aiResponse);

      // Save user input & AI response in MongoDB
      const newChat = await aiChatHistoryModel.create({
        userId,
        messages: [
          { role: "user", content: JSON.stringify(answers) },
          { role: "ai", content: aiResponse },
        ],
      });

      // Send the response back to the client
      res.status(200).json({
        success: true,
        data: aiResponse,
        chatId: newChat._id,
      });
    } catch (error: any) {
      console.log("AI error", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getAIChatHistory = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req?.user?._id;
      const chatHistory = await aiChatHistoryModel.find({ userId }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: chatHistory,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
export const continueAIChat = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userMessage } = req.body;
      const userId = req?.user?._id;

      // Retrieve existing chat
      const chat = await aiChatHistoryModel.findOne({  userId });

      if (!chat) return next(new ErrorHandler("Chat not found", 404));

      // Format conversation for AI
      const pastMessages = chat.messages.map((m) => `${m.role}: ${m.content}`).join("\n");
      const prompt = `${pastMessages}\nUser: ${userMessage}\nAI:`;

      // Call Google Gemini AI
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text();

      // Update chat history
      chat.messages.push({ role: "user", content: userMessage });
      chat.messages.push({ role: "ai", content: aiResponse });
      await chat.save();

      res.status(200).json({
        success: true,
        data: aiResponse,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

