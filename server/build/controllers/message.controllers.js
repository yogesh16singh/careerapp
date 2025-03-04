"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.sendMessage = exports.getAllMessages = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const socketServer_1 = require("../socketServer");
const constants_1 = require("../constants");
const chat_model_1 = __importDefault(require("../models/chat.model"));
const message_model_1 = __importDefault(require("../models/message.model"));
const helpers_1 = require("../utils/helpers");
/**
 * @description Utility function which returns the pipeline stages to structure the chat message schema with common lookups
 * @returns {mongoose.PipelineStage[]}
 */
const chatMessageCommonAggregation = () => {
    return [
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "sender",
                as: "sender",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            email: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                sender: { $first: "$sender" },
            },
        },
    ];
};
const getAllMessages = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { chatId } = req.params;
    const selectedChat = await chat_model_1.default.findById(chatId);
    if (!selectedChat) {
        throw new ApiError_1.ApiError(404, "Chat does not exist");
    }
    // Only send messages if the logged in user is a part of the chat he is requesting messages of
    if (!selectedChat.participants?.includes(req.user?._id)) {
        throw new ApiError_1.ApiError(400, "User is not a part of this chat");
    }
    const messages = await message_model_1.default.aggregate([
        {
            $match: {
                chat: new mongoose_1.default.Types.ObjectId(chatId),
            },
        },
        ...chatMessageCommonAggregation(),
        {
            $sort: {
                createdAt: -1,
            },
        },
    ]);
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, messages || [], "Messages fetched successfully"));
});
exports.getAllMessages = getAllMessages;
const sendMessage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    console.log("send message");
    const { chatId } = req.params;
    const { content } = req.body;
    if (!content && !req.files?.attachments?.length) {
        throw new ApiError_1.ApiError(400, "Message content or attachment is required");
    }
    const selectedChat = await chat_model_1.default.findById(chatId);
    if (!selectedChat) {
        throw new ApiError_1.ApiError(404, "Chat does not exist");
    }
    const messageFiles = [];
    if (req.files && req.files.attachments?.length > 0) {
        req.files.attachments?.map((attachment) => {
            messageFiles.push({
                url: (0, helpers_1.getStaticFilePath)(req, attachment.filename),
                localPath: (0, helpers_1.getLocalPath)(attachment.filename),
            });
        });
    }
    // Create a new message instance with appropriate metadata
    const message = await message_model_1.default.create({
        sender: new mongoose_1.default.Types.ObjectId(req.user._id),
        content: content || "",
        chat: new mongoose_1.default.Types.ObjectId(chatId),
        attachments: messageFiles,
    });
    // update the chat's last message which could be utilized to show last message in the list item
    const chat = await chat_model_1.default.findByIdAndUpdate(chatId, {
        $set: {
            lastMessage: message._id,
        },
    }, { new: true });
    // structure the message
    const messages = await message_model_1.default.aggregate([
        {
            $match: {
                _id: new mongoose_1.default.Types.ObjectId(message._id),
            },
        },
        ...chatMessageCommonAggregation(),
    ]);
    // Store the aggregation result
    const receivedMessage = messages[0];
    if (!receivedMessage) {
        throw new ApiError_1.ApiError(500, "Internal server error");
    }
    // logic to emit socket event about the new message created to the other participants
    chat.participants.forEach((participantObjectId) => {
        // here the chat is the raw instance of the chat in which participants is the array of object ids of users
        // avoid emitting event to the user who is sending the message
        if (participantObjectId.toString() === req.user._id.toString())
            return;
        // emit the receive message event to the other participants with received message as the payload
        (0, socketServer_1.emitSocketEvent)(req, participantObjectId.toString(), constants_1.ChatEventEnum.MESSAGE_RECEIVED_EVENT, receivedMessage);
    });
    return res
        .status(201)
        .json(new ApiResponse_1.ApiResponse(201, receivedMessage, "Message saved successfully"));
});
exports.sendMessage = sendMessage;
const deleteMessage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    //controller to delete chat messages and attachments
    const { chatId, messageId } = req.params;
    //Find the chat based on chatId and checking if user is a participant of the chat
    const chat = await chat_model_1.default.findOne({
        _id: new mongoose_1.default.Types.ObjectId(chatId),
        participants: req.user?._id,
    });
    if (!chat) {
        throw new ApiError_1.ApiError(404, "Chat does not exist");
    }
    //Find the message based on message id
    const message = await message_model_1.default.findOne({
        _id: new mongoose_1.default.Types.ObjectId(messageId),
    });
    if (!message) {
        throw new ApiError_1.ApiError(404, "Message does not exist");
    }
    // Check if user is the sender of the message
    if (message.sender.toString() !== req.user._id.toString()) {
        throw new ApiError_1.ApiError(403, "You are not the authorised to delete the message, you are not the sender");
    }
    if (message.attachments.length > 0) {
        //If the message is attachment  remove the attachments from the server
        message.attachments.map((asset) => {
            (0, helpers_1.removeLocalFile)(asset.localPath);
        });
    }
    //deleting the message from DB
    await message_model_1.default.deleteOne({
        _id: new mongoose_1.default.Types.ObjectId(messageId),
    });
    //Updating the last message of the chat to the previous message after deletion if the message deleted was last message
    if (chat.lastMessage.toString() === message._id.toString()) {
        const lastMessage = await message_model_1.default.findOne({ chat: chatId }, {}, { sort: { createdAt: -1 } });
        await chat_model_1.default.findByIdAndUpdate(chatId, {
            lastMessage: lastMessage ? lastMessage?._id : null,
        });
    }
    // logic to emit socket event about the message deleted  to the other participants
    chat.participants.forEach((participantObjectId) => {
        // here the chat is the raw instance of the chat in which participants is the array of object ids of users
        // avoid emitting event to the user who is deleting the message
        if (participantObjectId.toString() === req.user._id.toString())
            return;
        // emit the delete message event to the other participants frontend with delete messageId as the payload
        (0, socketServer_1.emitSocketEvent)(req, participantObjectId.toString(), constants_1.ChatEventEnum.MESSAGE_DELETE_EVENT, message);
    });
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, message, "Message deleted successfully"));
});
exports.deleteMessage = deleteMessage;
