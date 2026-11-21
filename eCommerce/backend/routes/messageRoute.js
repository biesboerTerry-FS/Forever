import express from "express";
import staffAuth from "../middleware/staffAuth.js";
import {
	listMessages,
	createMessage,
	markMessageRead,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.use(staffAuth);

messageRouter.get("/", listMessages);
messageRouter.post("/", createMessage);
messageRouter.patch("/:id/read", markMessageRead);

export default messageRouter;
