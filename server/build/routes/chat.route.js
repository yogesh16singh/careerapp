"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controllers_1 = require("../controllers/chat.controllers");
const auth_1 = require("../middleware/auth");
const chat_validators_1 = require("../validators/chat.validators");
const validate_1 = require("../validators/validate");
const mongodb_validators_1 = require("../validators/common/mongodb.validators");
const router = (0, express_1.Router)();
router.use(auth_1.isAuthenticated);
router.route("/").get(chat_controllers_1.getAllChats);
router.route("/users").get(chat_controllers_1.searchAvailableUsers);
router
    .route("/c/:receiverId")
    .post((0, mongodb_validators_1.mongoIdPathVariableValidator)("receiverId"), validate_1.validate, chat_controllers_1.createOrGetAOneOnOneChat);
router
    .route("/group")
    .post((0, chat_validators_1.createAGroupChatValidator)(), validate_1.validate, chat_controllers_1.createAGroupChat);
router
    .route("/group/:chatId")
    .get((0, mongodb_validators_1.mongoIdPathVariableValidator)("chatId"), validate_1.validate, chat_controllers_1.getGroupChatDetails)
    .patch((0, mongodb_validators_1.mongoIdPathVariableValidator)("chatId"), (0, chat_validators_1.updateGroupChatNameValidator)(), validate_1.validate, chat_controllers_1.renameGroupChat)
    .delete((0, mongodb_validators_1.mongoIdPathVariableValidator)("chatId"), validate_1.validate, chat_controllers_1.deleteGroupChat);
router
    .route("/group/:chatId/:participantId")
    .post((0, mongodb_validators_1.mongoIdPathVariableValidator)("chatId"), (0, mongodb_validators_1.mongoIdPathVariableValidator)("participantId"), validate_1.validate, chat_controllers_1.addNewParticipantInGroupChat)
    .delete((0, mongodb_validators_1.mongoIdPathVariableValidator)("chatId"), (0, mongodb_validators_1.mongoIdPathVariableValidator)("participantId"), validate_1.validate, chat_controllers_1.removeParticipantFromGroupChat);
router
    .route("/leave/group/:chatId")
    .delete((0, mongodb_validators_1.mongoIdPathVariableValidator)("chatId"), validate_1.validate, chat_controllers_1.leaveGroupChat);
router
    .route("/remove/:chatId")
    .delete((0, mongodb_validators_1.mongoIdPathVariableValidator)("chatId"), validate_1.validate, chat_controllers_1.deleteOneOnOneChat);
exports.default = router;
