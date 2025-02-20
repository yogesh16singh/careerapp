import { Router } from "express";

import { isAuthenticated } from "../middleware/auth";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb.validators";
import { sendMessageValidator } from "../validators/message.validators";
import { upload } from "../middleware/multer.middlewares";
import { deleteMessage, getAllMessages, sendMessage } from "../controllers/message.controllers";

const router = Router();

router.use(isAuthenticated);

router
  .route("/:chatId")
  .get(mongoIdPathVariableValidator("chatId"), isAuthenticated, getAllMessages)
  .post(
    upload.fields([{ name: "attachments", maxCount: 5 }]),
    mongoIdPathVariableValidator("chatId"),
    sendMessageValidator(),
    isAuthenticated,
    sendMessage
  );

//Delete message route based on Message id

router
  .route("/:chatId/:messageId")
  .delete(
    mongoIdPathVariableValidator("chatId"),
    mongoIdPathVariableValidator("messageId"),
    isAuthenticated,
    deleteMessage
  );

export default router;
