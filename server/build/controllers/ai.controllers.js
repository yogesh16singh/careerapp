"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.continueAIChat = exports.getAIChatHistory = exports.submitOptionsToAI = void 0;
require("dotenv").config();
const generative_ai_1 = require("@google/generative-ai");
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const aiChatHistory_model_1 = __importDefault(require("../models/aiChatHistory.model"));
// Initialize Google Gemini API
const genAI = new generative_ai_1.GoogleGenerativeAI("AIzaSyBXiwmvEs_Pt-LNJ14wHNDcFnLskcsrTqU");
exports.submitOptionsToAI = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
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
        const newChat = await aiChatHistory_model_1.default.create({
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
    }
    catch (error) {
        console.log("AI error", error);
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.getAIChatHistory = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const userId = req?.user?._id;
        const chatHistory = await aiChatHistory_model_1.default.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: chatHistory,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.continueAIChat = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { userMessage } = req.body;
        const userId = req?.user?._id;
        // Retrieve existing chat
        const chat = await aiChatHistory_model_1.default.findOne({ userId });
        if (!chat)
            return next(new ErrorHandler_1.default("Chat not found", 404));
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
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
