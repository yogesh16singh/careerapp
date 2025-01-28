import mongoose, { Document, Model, Schema } from "mongoose";

// Define the message subdocument interface
export interface IMessage {
    senderId: mongoose.Schema.Types.ObjectId; // Reference to User model
    content: string; // The actual message content
    sentAt: Date; // Timestamp for the message
}

// Define the chat document interface
export interface IChat extends Document {
    participants: mongoose.Schema.Types.ObjectId[]; // Array of User IDs (student, counselor)
    messages: IMessage[]; // Array of message subdocuments
    lastMessageAt: Date; // Timestamp for the last message
    createdAt: Date;
    updatedAt: Date;
}

// Define the message schema
const messageSchema = new mongoose.Schema<IMessage>(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        sentAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false } // Prevents automatic creation of _id for subdocuments
);

// Define the chat schema
const chatSchema = new mongoose.Schema<IChat>(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        messages: [messageSchema],
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Static method to get chats for a specific user
chatSchema.statics.getChatsForUser = function (
    userId: mongoose.Schema.Types.ObjectId
): Promise<IChat[]> {
    return this.find({ participants: userId })
        .populate("participants", "name email role") // Populate participant details
        .sort({ lastMessageAt: -1 });
};

// Static method to send a new message
chatSchema.statics.addMessage = async function (
    chatId: mongoose.Schema.Types.ObjectId,
    senderId: mongoose.Schema.Types.ObjectId,
    content: string
): Promise<IChat | null> {
    const chat = await this.findById(chatId);
    if (chat) {
        const message = { senderId, content, sentAt: new Date() };
        chat.messages.push(message);
        chat.lastMessageAt = message.sentAt;
        await chat.save();
        return chat;
    }
    return null;
};

// Create and export the Chat model
const chatModel: Model<IChat> = mongoose.model<IChat>("Chat", chatSchema);
export default chatModel;
