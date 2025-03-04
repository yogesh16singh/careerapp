"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const mongodb_validators_1 = require("../validators/common/mongodb.validators");
const message_validators_1 = require("../validators/message.validators");
const multer_middlewares_1 = require("../middleware/multer.middlewares");
const message_controllers_1 = require("../controllers/message.controllers");
const router = (0, express_1.Router)();
router.use(auth_1.isAuthenticated);
router
    .route("/:chatId")
    .get((0, mongodb_validators_1.mongoIdPathVariableValidator)("chatId"), auth_1.isAuthenticated, message_controllers_1.getAllMessages)
    .post(multer_middlewares_1.upload.fields([{ name: "attachments", maxCount: 5 }]), (0, mongodb_validators_1.mongoIdPathVariableValidator)("chatId"), (0, message_validators_1.sendMessageValidator)(), auth_1.isAuthenticated, message_controllers_1.sendMessage);
//Delete message route based on Message id
router
    .route("/:chatId/:messageId")
    .delete((0, mongodb_validators_1.mongoIdPathVariableValidator)("chatId"), (0, mongodb_validators_1.mongoIdPathVariableValidator)("messageId"), auth_1.isAuthenticated, message_controllers_1.deleteMessage);
exports.default = router;
