import express from "express";
import { subscribe } from "../controllers/newsletterController.js";
import { validateNewsletter } from "../middleware/validate.js";

const newsletterRouter = express.Router();

newsletterRouter.post("/subscribe", validateNewsletter, subscribe);

export default newsletterRouter;
