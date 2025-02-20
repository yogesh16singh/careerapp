import mongoose, { Schema, Document, Model } from "mongoose";

// TODO: Add image and pdf file sharing in the next version
interface IAttachment {
  url: string;
  localPath: string;
}

interface IChatMessage extends Document {
  sender: mongoose.Types.ObjectId;
  content?: string;
  attachments: IAttachment[];
  chat: mongoose.Types.ObjectId;
}

const chatMessageSchema: Schema<IChatMessage> = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
    },
    attachments: {
      type: [
        {
          url: String,
          localPath: String,
        },
      ],
      default: [],
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
  },
  { timestamps: true }
);

const ChatMessage: Model<IChatMessage> = mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);

export default ChatMessage;
