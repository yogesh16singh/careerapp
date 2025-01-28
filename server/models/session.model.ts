import mongoose, { Document, Model, Schema } from "mongoose";

// Session status types
type SessionStatus = "pending" | "completed" | "canceled";

export interface ISession extends Document {
    studentId: mongoose.Schema.Types.ObjectId;
    counselorId: mongoose.Schema.Types.ObjectId;
    sessionDate: Date;
    sessionTime: string; // Use time as string to easily format and parse
    status: SessionStatus;
    feedback?: string;
    rating?: number; // Optional feedback/rating from student
    createdAt: Date;
    updatedAt: Date;
}

// Define the session schema
const sessionSchema: Schema<ISession> = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Student ID is required."],
            ref: "User", // Reference to User model (Student)
        },
        counselorId: {
            type: mongoose.Schema.Types.ObjectId,
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
    },
    { timestamps: true }
);

// Method to check if session is complete or canceled
sessionSchema.methods.isSessionCompletedOrCanceled = function (): boolean {
    return this.status === "completed" || this.status === "canceled";
};

// Static method to get all sessions for a specific user (either student or counselor)
sessionSchema.statics.getSessionsForUser = function (
    userId: mongoose.Schema.Types.ObjectId,
    role: "student" | "counselor"
): Promise<ISession[]> {
    const query =
        role === "student"
            ? { studentId: userId }
            : { counselorId: userId };

    return this.find(query).sort({ sessionDate: -1 });
};

const sessionModel: Model<ISession> = mongoose.model<ISession>("Session", sessionSchema);

export default sessionModel;
