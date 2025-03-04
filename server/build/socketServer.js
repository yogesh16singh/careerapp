"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitSocketEvent = exports.initializeSocketIO = void 0;
const cookie_1 = __importDefault(require("cookie"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("./constants");
const user_model_1 = __importDefault(require("./models/user.model"));
const ErrorHandler_1 = __importDefault(require("./utils/ErrorHandler"));
const mountJoinChatEvent = (socket) => {
    socket.on(constants_1.ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
        console.log(`User joined the chat 🤝. chatId: `, chatId);
        socket.join(chatId);
    });
};
const mountParticipantTypingEvent = (socket) => {
    socket.on(constants_1.ChatEventEnum.TYPING_EVENT, (chatId) => {
        socket.in(chatId).emit(constants_1.ChatEventEnum.TYPING_EVENT, chatId);
    });
};
const mountParticipantStoppedTypingEvent = (socket) => {
    socket.on(constants_1.ChatEventEnum.STOP_TYPING_EVENT, (chatId) => {
        socket.in(chatId).emit(constants_1.ChatEventEnum.STOP_TYPING_EVENT, chatId);
    });
};
const initializeSocketIO = (io) => {
    return io.on("connection", async (socket) => {
        try {
            const cookies = cookie_1.default.parse(socket.handshake.headers?.cookie || "");
            let token = cookies?.accessToken || socket.handshake.auth?.token;
            if (!token) {
                return new ErrorHandler_1.default("Un-authorized handshake. Token is missing", 401);
                // throw new ApiError(401, "Un-authorized handshake. Token is missing");
            }
            const decodedToken = jsonwebtoken_1.default.decode(token);
            const user = await user_model_1.default.findById(decodedToken?.id);
            if (!user) {
                return new ErrorHandler_1.default("Un-authorized handshake. Token is invalid", 401);
                // throw new ApiError(401, "Un-authorized handshake. Token is invalid");
            }
            socket.user = user;
            socket.join(user._id.toString());
            socket.emit(constants_1.ChatEventEnum.CONNECTED_EVENT);
            console.log("User connected 🗼. userId: ", user._id.toString());
            mountJoinChatEvent(socket);
            mountParticipantTypingEvent(socket);
            mountParticipantStoppedTypingEvent(socket);
            socket.on(constants_1.ChatEventEnum.DISCONNECT_EVENT, () => {
                console.log("user has disconnected 🚫. userId: " + socket.user?._id);
                if (socket.user?._id) {
                    socket.leave(socket.user._id);
                }
            });
        }
        catch (error) {
            socket.emit(constants_1.ChatEventEnum.SOCKET_ERROR_EVENT, error?.message || "Something went wrong while connecting to the socket.");
        }
    });
};
exports.initializeSocketIO = initializeSocketIO;
/**
 *
 * @param {import("express").Request} req - Request object to access the `io` instance set at the entry point
 * @param {string} roomId - Room where the event should be emitted
 * @param {AvailableChatEvents[0]} event - Event that should be emitted
 * @param {any} payload - Data that should be sent when emitting the event
 * @description Utility function responsible to abstract the logic of socket emission via the io instance
 */
const emitSocketEvent = (req, roomId, event, payload) => {
    req.app.get("io").in(roomId).emit(event, payload);
};
exports.emitSocketEvent = emitSocketEvent;
