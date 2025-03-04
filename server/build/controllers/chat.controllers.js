"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAvailableUsers = exports.renameGroupChat = exports.removeParticipantFromGroupChat = exports.leaveGroupChat = exports.getGroupChatDetails = exports.getAllChats = exports.deleteOneOnOneChat = exports.deleteGroupChat = exports.createOrGetAOneOnOneChat = exports.createAGroupChat = exports.addNewParticipantInGroupChat = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const message_model_1 = __importDefault(require("../models/message.model"));
const constants_1 = require("../constants");
const user_model_1 = __importDefault(require("../models/user.model"));
const chat_model_1 = __importDefault(require("../models/chat.model"));
const socketServer_1 = require("../socketServer");
const helpers_1 = require("../utils/helpers");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
/**
 * @description Utility function which returns the pipeline stages to structure the chat schema with common lookups
 * @returns {mongoose.PipelineStage[]}
 */
const chatCommonAggregation = () => {
    return [
        {
            // lookup for the participants present
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "participants",
                as: "participants",
                pipeline: [
                    {
                        $project: {
                            // password: 0,
                            // refreshToken: 0,
                            // forgotPasswordToken: 0,
                            // forgotPasswordExpiry: 0,
                            // emailVerificationToken: 0,
                            // emailVerificationExpiry: 0,
                            _id: 1,
                            avatar: 1,
                            name: 1,
                            email: 1,
                            role: 1,
                        },
                    },
                ],
            },
        },
        {
            // lookup for the group chats
            $lookup: {
                from: "chatmessages",
                foreignField: "_id",
                localField: "lastMessage",
                as: "lastMessage",
                pipeline: [
                    {
                        // get details of the sender
                        $lookup: {
                            from: "users",
                            foreignField: "_id",
                            localField: "sender",
                            as: "sender",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
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
                ],
            },
        },
        {
            $addFields: {
                lastMessage: { $first: "$lastMessage" },
            },
        },
    ];
};
/**
 *
 * @param {string} chatId
 * @description utility function responsible for removing all the messages and file attachments attached to the deleted chat
 */
const deleteCascadeChatMessages = async (chatId) => {
    // fetch the messages associated with the chat to remove
    const messages = await message_model_1.default.find({
        chat: new mongoose_1.default.Types.ObjectId(chatId),
    });
    let attachments = [];
    // get the attachments present in the messages
    attachments = attachments.concat(...messages.map((message) => {
        return message.attachments;
    }));
    attachments.forEach((attachment) => {
        // remove attachment files from the local storage
        (0, helpers_1.removeLocalFile)(attachment.localPath);
    });
    // delete all the messages
    await message_model_1.default.deleteMany({
        chat: new mongoose_1.default.Types.ObjectId(chatId),
    });
};
const searchAvailableUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const users = await user_model_1.default.aggregate([
        {
            $match: {
                _id: {
                    $ne: req.user._id, // avoid logged in user
                },
            },
        },
        {
            $project: {
                avatar: 1,
                username: 1,
                email: 1,
            },
        },
    ]);
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, users, "Users fetched successfully"));
});
exports.searchAvailableUsers = searchAvailableUsers;
const createOrGetAOneOnOneChat = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { receiverId } = req.params;
    // Check if it's a valid receiver
    const receiver = await user_model_1.default.findById(receiverId);
    if (!receiver) {
        throw new ApiError_1.ApiError(404, "Receiver does not exist");
    }
    // check if receiver is not the user who is requesting a chat
    if (receiver._id.toString() === req.user._id.toString()) {
        throw new ApiError_1.ApiError(400, "You cannot chat with yourself");
    }
    const chat = await chat_model_1.default.aggregate([
        {
            $match: {
                isGroupChat: false, // avoid group chats. This controller is responsible for one on one chats
                // Also, filter chats with participants having receiver and logged in user only
                $and: [
                    {
                        participants: { $elemMatch: { $eq: new mongoose_1.default.Types.ObjectId(req.user._id) } },
                    },
                    {
                        participants: {
                            $elemMatch: { $eq: new mongoose_1.default.Types.ObjectId(receiverId) },
                        },
                    },
                ],
            },
        },
        ...chatCommonAggregation(),
    ]);
    console.log("chat", chat[0]);
    if (chat.length) {
        // if we find the chat that means user already has created a chat
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponse(200, chat[0], "Chat retrieved successfully"));
    }
    // if not we need to create a new one on one chat
    const newChatInstance = await chat_model_1.default.create({
        name: "One on one chat",
        participants: [req.user._id, new mongoose_1.default.Types.ObjectId(receiverId)], // add receiver and logged in user as participants
        admin: req.user._id,
    });
    // structure the chat as per the common aggregation to keep the consistency
    const createdChat = await chat_model_1.default.aggregate([
        {
            $match: {
                _id: newChatInstance._id,
            },
        },
        ...chatCommonAggregation(),
    ]);
    const payload = createdChat[0]; // store the aggregation result
    if (!payload) {
        throw new ApiError_1.ApiError(500, "Internal server error");
    }
    // logic to emit socket event about the new chat added to the participants
    payload?.participants?.forEach((participant) => {
        if (participant._id.toString() === req.user._id.toString())
            return; // don't emit the event for the logged in use as he is the one who is initiating the chat
        // emit event to other participants with new chat as a payload
        (0, socketServer_1.emitSocketEvent)(req, participant._id?.toString(), constants_1.ChatEventEnum.NEW_CHAT_EVENT, payload);
    });
    return res
        .status(201)
        .json(new ApiResponse_1.ApiResponse(201, payload, "Chat retrieved successfully"));
});
exports.createOrGetAOneOnOneChat = createOrGetAOneOnOneChat;
const createAGroupChat = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, participants } = req.body;
    // Check if user is not sending himself as a participant. This will be done manually
    if (participants.includes(req.user._id.toString())) {
        throw new ApiError_1.ApiError(400, "Participants array should not contain the group creator");
    }
    const members = [...new Set([...participants, req.user._id.toString()])]; // check for duplicates
    if (members.length < 3) {
        // check after removing the duplicate
        // We want group chat to have minimum 3 members including admin
        throw new ApiError_1.ApiError(400, "Seems like you have passed duplicate participants.");
    }
    // Create a group chat with provided members
    const groupChat = await chat_model_1.default.create({
        name,
        isGroupChat: true,
        participants: members,
        admin: req.user._id,
    });
    // structure the chat
    const chat = await chat_model_1.default.aggregate([
        {
            $match: {
                _id: groupChat._id,
            },
        },
        ...chatCommonAggregation(),
    ]);
    const payload = chat[0];
    if (!payload) {
        throw new ApiError_1.ApiError(500, "Internal server error");
    }
    // logic to emit socket event about the new group chat added to the participants
    payload?.participants?.forEach((participant) => {
        if (participant._id.toString() === req.user._id.toString())
            return; // don't emit the event for the logged in use as he is the one who is initiating the chat
        // emit event to other participants with new chat as a payload
        (0, socketServer_1.emitSocketEvent)(req, participant._id?.toString(), constants_1.ChatEventEnum.NEW_CHAT_EVENT, payload);
    });
    return res
        .status(201)
        .json(new ApiResponse_1.ApiResponse(201, payload, "Group chat created successfully"));
});
exports.createAGroupChat = createAGroupChat;
const getGroupChatDetails = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { chatId } = req.params;
    const groupChat = await chat_model_1.default.aggregate([
        {
            $match: {
                _id: new mongoose_1.default.Types.ObjectId(chatId),
                isGroupChat: true,
            },
        },
        ...chatCommonAggregation(),
    ]);
    const chat = groupChat[0];
    if (!chat) {
        throw new ApiError_1.ApiError(404, "Group chat does not exist");
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, chat, "Group chat fetched successfully"));
});
exports.getGroupChatDetails = getGroupChatDetails;
const renameGroupChat = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { chatId } = req.params;
    const { name } = req.body;
    // check for chat existence
    const groupChat = await chat_model_1.default.findOne({
        _id: new mongoose_1.default.Types.ObjectId(chatId),
        isGroupChat: true,
    });
    if (!groupChat) {
        throw new ApiError_1.ApiError(404, "Group chat does not exist");
    }
    // only admin can change the name
    if (groupChat.admin?.toString() !== req.user._id?.toString()) {
        throw new ApiError_1.ApiError(404, "You are not an admin");
    }
    const updatedGroupChat = await chat_model_1.default.findByIdAndUpdate(chatId, {
        $set: {
            name,
        },
    }, { new: true });
    const chat = await chat_model_1.default.aggregate([
        {
            $match: {
                _id: updatedGroupChat._id,
            },
        },
        ...chatCommonAggregation(),
    ]);
    const payload = chat[0];
    if (!payload) {
        throw new ApiError_1.ApiError(500, "Internal server error");
    }
    // logic to emit socket event about the updated chat name to the participants
    payload?.participants?.forEach((participant) => {
        // emit event to all the participants with updated chat as a payload
        (0, socketServer_1.emitSocketEvent)(req, participant._id?.toString(), constants_1.ChatEventEnum.UPDATE_GROUP_NAME_EVENT, payload);
    });
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, chat[0], "Group chat name updated successfully"));
});
exports.renameGroupChat = renameGroupChat;
const deleteGroupChat = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { chatId } = req.params;
    // check for the group chat existence
    const groupChat = await chat_model_1.default.aggregate([
        {
            $match: {
                _id: new mongoose_1.default.Types.ObjectId(chatId),
                isGroupChat: true,
            },
        },
        ...chatCommonAggregation(),
    ]);
    const chat = groupChat[0];
    if (!chat) {
        throw new ApiError_1.ApiError(404, "Group chat does not exist");
    }
    // check if the user who is deleting is the group admin
    if (chat.admin?.toString() !== req.user._id?.toString()) {
        throw new ApiError_1.ApiError(404, "Only admin can delete the group");
    }
    await chat_model_1.default.findByIdAndDelete(chatId); // delete the chat
    await deleteCascadeChatMessages(chatId); // remove all messages and attachments associated with the chat
    // logic to emit socket event about the group chat deleted to the participants
    chat?.participants?.forEach((participant) => {
        if (participant._id.toString() === req.user._id.toString())
            return; // don't emit the event for the logged in use as he is the one who is deleting
        // emit event to other participants with left chat as a payload
        (0, socketServer_1.emitSocketEvent)(req, participant._id?.toString(), constants_1.ChatEventEnum.LEAVE_CHAT_EVENT, chat);
    });
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, {}, "Group chat deleted successfully"));
});
exports.deleteGroupChat = deleteGroupChat;
const deleteOneOnOneChat = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { chatId } = req.params;
    // check for chat existence
    const chat = await chat_model_1.default.aggregate([
        {
            $match: {
                _id: new mongoose_1.default.Types.ObjectId(chatId),
            },
        },
        ...chatCommonAggregation(),
    ]);
    const payload = chat[0];
    if (!payload) {
        throw new ApiError_1.ApiError(404, "Chat does not exist");
    }
    await chat_model_1.default.findByIdAndDelete(chatId); // delete the chat even if user is not admin because it's a personal chat
    await deleteCascadeChatMessages(chatId); // delete all the messages and attachments associated with the chat
    const otherParticipant = payload?.participants?.find((participant) => participant?._id.toString() !== req.user._id.toString() // get the other participant in chat for socket
    );
    // emit event to other participant with left chat as a payload
    (0, socketServer_1.emitSocketEvent)(req, otherParticipant._id?.toString(), constants_1.ChatEventEnum.LEAVE_CHAT_EVENT, payload);
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, {}, "Chat deleted successfully"));
});
exports.deleteOneOnOneChat = deleteOneOnOneChat;
const leaveGroupChat = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { chatId } = req.params;
    // check if chat is a group
    const groupChat = await chat_model_1.default.findOne({
        _id: new mongoose_1.default.Types.ObjectId(chatId),
        isGroupChat: true,
    });
    if (!groupChat) {
        throw new ApiError_1.ApiError(404, "Group chat does not exist");
    }
    const existingParticipants = groupChat.participants;
    // check if the participant that is leaving the group, is part of the group
    if (!existingParticipants?.includes(req.user?._id)) {
        throw new ApiError_1.ApiError(400, "You are not a part of this group chat");
    }
    const updatedChat = await chat_model_1.default.findByIdAndUpdate(chatId, {
        $pull: {
            participants: req.user?._id, // leave the group
        },
    }, { new: true });
    const chat = await chat_model_1.default.aggregate([
        {
            $match: {
                _id: updatedChat._id,
            },
        },
        ...chatCommonAggregation(),
    ]);
    const payload = chat[0];
    if (!payload) {
        throw new ApiError_1.ApiError(500, "Internal server error");
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, payload, "Left a group successfully"));
});
exports.leaveGroupChat = leaveGroupChat;
const addNewParticipantInGroupChat = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { chatId, participantId } = req.params;
    // check if chat is a group
    const groupChat = await chat_model_1.default.findOne({
        _id: new mongoose_1.default.Types.ObjectId(chatId),
        isGroupChat: true,
    });
    if (!groupChat) {
        throw new ApiError_1.ApiError(404, "Group chat does not exist");
    }
    // check if user who is adding is a group admin
    if (groupChat.admin?.toString() !== req.user._id?.toString()) {
        throw new ApiError_1.ApiError(404, "You are not an admin");
    }
    const existingParticipants = groupChat.participants;
    // check if the participant that is being added in a part of the group
    if (existingParticipants?.includes(participantId)) {
        throw new ApiError_1.ApiError(409, "Participant already in a group chat");
    }
    const updatedChat = await chat_model_1.default.findByIdAndUpdate(chatId, {
        $push: {
            participants: participantId, // add new participant id
        },
    }, { new: true });
    const chat = await chat_model_1.default.aggregate([
        {
            $match: {
                _id: updatedChat._id,
            },
        },
        ...chatCommonAggregation(),
    ]);
    const payload = chat[0];
    if (!payload) {
        throw new ApiError_1.ApiError(500, "Internal server error");
    }
    // emit new chat event to the added participant
    (0, socketServer_1.emitSocketEvent)(req, participantId, constants_1.ChatEventEnum.NEW_CHAT_EVENT, payload);
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, payload, "Participant added successfully"));
});
exports.addNewParticipantInGroupChat = addNewParticipantInGroupChat;
const removeParticipantFromGroupChat = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { chatId, participantId } = req.params;
    // check if chat is a group
    const groupChat = await chat_model_1.default.findOne({
        _id: new mongoose_1.default.Types.ObjectId(chatId),
        isGroupChat: true,
    });
    if (!groupChat) {
        throw new ApiError_1.ApiError(404, "Group chat does not exist");
    }
    // check if user who is deleting is a group admin
    if (groupChat.admin?.toString() !== req.user._id?.toString()) {
        throw new ApiError_1.ApiError(404, "You are not an admin");
    }
    const existingParticipants = groupChat.participants;
    // check if the participant that is being removed in a part of the group
    if (!existingParticipants?.includes(participantId)) {
        throw new ApiError_1.ApiError(400, "Participant does not exist in the group chat");
    }
    const updatedChat = await chat_model_1.default.findByIdAndUpdate(chatId, {
        $pull: {
            participants: participantId, // remove participant id
        },
    }, { new: true });
    const chat = await chat_model_1.default.aggregate([
        {
            $match: {
                _id: updatedChat._id,
            },
        },
        ...chatCommonAggregation(),
    ]);
    const payload = chat[0];
    if (!payload) {
        throw new ApiError_1.ApiError(500, "Internal server error");
    }
    // emit leave chat event to the removed participant
    (0, socketServer_1.emitSocketEvent)(req, participantId, constants_1.ChatEventEnum.LEAVE_CHAT_EVENT, payload);
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, payload, "Participant removed successfully"));
});
exports.removeParticipantFromGroupChat = removeParticipantFromGroupChat;
const getAllChats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // console.log("req.user", req.user);
    const chats = await chat_model_1.default.aggregate([
        {
            $match: {
                participants: { $elemMatch: { $eq: new mongoose_1.default.Types.ObjectId(req.user._id) } }, // get all chats that have logged in user as a participant
            },
        },
        {
            $sort: {
                updatedAt: -1,
            },
        },
        ...chatCommonAggregation(),
        {
            // Ensure that participants are properly formatted
            $project: {
                _id: 1,
                name: 1,
                isGroupChat: 1,
                admin: 1,
                createdAt: 1,
                updatedAt: 1,
                participants: 1, // Keep as an array of user objects
                lastMessage: 1,
            },
        },
    ]);
    // console.log("all chats", JSON.stringify(chats, null, 2)); // Print chats properly
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, chats || [], "User chats fetched successfully!"));
});
exports.getAllChats = getAllChats;
