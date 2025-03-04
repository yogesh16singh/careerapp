import mongoose, { Schema, Document } from "mongoose";

export interface IChatHistory extends Document {
  userId: string;
  messages: { role: "user" | "ai"; content: string }[];
  createdAt: Date;
}

const AiChatHistorySchema = new Schema<IChatHistory>(
  {
    userId: { type: String, required: true },
    messages: [
      {
        role: { type: String, enum: ["user", "ai"], required: true },
        content: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IChatHistory>("ChatHistory", AiChatHistorySchema);
