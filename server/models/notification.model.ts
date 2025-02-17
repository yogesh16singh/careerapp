import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: string; // ID of the user (receiver)
  title: string;
  body: string;
  data?: object;
  isRead: boolean; // Track if the notification is read
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  data: { type: Object, default: {} },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);
export default NotificationModel;
