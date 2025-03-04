"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define the session schema
const sessionSchema = new mongoose_1.default.Schema({
    studentId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: [true, "Student ID is required."],
        ref: "User", // Reference to User model (Student)
    },
    counselorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: [true, "Counselor ID is required."],
        ref: "User", // Reference to User model (Counselor)
    },
    sessionDate: {
        type: Date,
        required: [true, "Session date is required."],
    },
    sessionTime: {
        type: String,
        required: [true, "Session time is required."],
    },
    status: {
        type: String,
        enum: ["pending", "completed", "canceled"],
        default: "pending",
    },
    feedback: {
        type: String,
        default: null,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
    },
}, { timestamps: true });
// Method to check if session is complete or canceled
sessionSchema.methods.isSessionCompletedOrCanceled = function () {
    return this.status === "completed" || this.status === "canceled";
};
// Static method to get all sessions for a specific user (either student or counselor)
sessionSchema.statics.getSessionsForUser = function (userId, role) {
    const query = role === "student"
        ? { studentId: userId }
        : { counselorId: userId };
    return this.find(query).sort({ sessionDate: -1 });
};
const sessionModel = mongoose_1.default.model("Session", sessionSchema);
exports.default = sessionModel;
