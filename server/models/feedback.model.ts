import mongoose, { Document, Model, Schema } from "mongoose";

export interface IFeedback extends Document {
    sessionId: mongoose.Schema.Types.ObjectId; // Reference to the session
    studentId: mongoose.Schema.Types.ObjectId;
    counselorId: mongoose.Schema.Types.ObjectId;
    rating: number; // Rating scale from 1 to 5
    comment: string;
    createdAt: Date;
}

const feedbackSchema: Schema<IFeedback> = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
            required: true,
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        counselorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const feedbackModel: Model<IFeedback> = mongoose.model<IFeedback>("Feedback", feedbackSchema);
export default feedbackModel;
