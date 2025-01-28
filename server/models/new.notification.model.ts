import mongoose, { Document, Model, Schema } from "mongoose";

export interface INotification extends Document {
    userId: mongoose.Schema.Types.ObjectId; // User who will receive the notification
    content: string; // Notification message
    status: "unread" | "read"; // Whether the notification has been read
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema: Schema<INotification> = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        content: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["unread", "read"],
            default: "unread",
        },
    },
    { timestamps: true }
);

const notificationModel: Model<INotification> = mongoose.model<INotification>("Notification", notificationSchema);
export default notificationModel;
