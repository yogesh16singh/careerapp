require('dotenv').config()
import { Request, Response, NextFunction } from 'express'
import { OpenAI } from "openai";

import { GoogleGenerativeAI } from "@google/generative-ai";
import userModel, { IUser } from '../models/user.model'
import { CatchAsyncError } from '../middleware/catchAsyncErrors'
import ErrorHandler from '../utils/ErrorHandler';
import jwt, { JwtPayload, Secret } from "jsonwebtoken"
import ejs from "ejs"
import path from 'path';
import sendMail from '../utils/sendMail';
import { accessTokenOptions, refreshTokenOptions, sendToken } from '../utils/jwt';
import { redis } from '../utils/redis';
import { getAllUsersService, getUserById, updatetUserRoleService } from '../services/user.service';
import cloudinary from "cloudinary"

// Initialize OpenAI client with your API key
const part1='sk-proj-qE6kcWMOHs-7A9bjcmMatv0etsUBLh_Ue9QEFjmgCeCUfUDiXYz'
const part2='TAfiCzXT3BlbkFJ_wb6jEapceKbOkEEYe2wuuF56d6fA7bUgIR2Fit2Zyplk7arYCyvF_hVAA'

const openai = new OpenAI({
    apiKey: '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',
});
// Initialize Google Gemini API
const genAI = new GoogleGenerativeAI('AIzaSyAsvx5eCH5g-aIjZeSzEv5f2c_ohc_cP0c');

export const submitOptionsToAI = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { answers } = req.body;

        // Format the answers into a prompt for OpenAI
        const prompt = `
            Based on the following answers:
            1. What interests you the most? ${answers["1"]}
            2. What are your key strengths? ${answers["2"]}
            3. Preferred work environment? ${answers["3"]}
            
            Please suggest a career path that aligns with these preferences.
        `;

        // Call OpenAI API with the formatted prompt
        // const response = await openai.chat.completions.create({
        //     model: 'gpt-3.5-turbo', // or 'gpt-3.5-turbo' for cheaper options
        //     messages: [
        //         {
        //             role: 'user',
        //             content: prompt,
        //         },
        //     ],
        // });

         // Call Google Gemini AI
        //  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        //  const result = await model.generateContent(prompt);
        //  const aiResponse = result.response.text();
 

        // Get the response message from OpenAI
        // const aiResponse = response.choices[0]?.message?.content || "I couldn't provide a suggestion at the moment.";
        const dummyResponse = `🔹 Software Engineering & Development
Backend Developer (Node.js, Go, Python, Java) – Works with databases, APIs, and server-side logic.
Full-Stack Developer (MERN, Next.js, Go, Redis) – Combines frontend and backend skills for complete solutions.
Cloud Engineer (AWS, GCP, Azure) – Focuses on cloud infrastructure and scalable applications.
DevOps Engineer (CI/CD, Docker, Kubernetes) – Bridges development and operations for automated deployment.`
        // Send the response back to the client
        res.status(200).json({
            success: true,
            data: dummyResponse,
        });
    } catch (error: any) {
        console.log("ai error", error);
        return next(new ErrorHandler(error.message, 400));
    }
});