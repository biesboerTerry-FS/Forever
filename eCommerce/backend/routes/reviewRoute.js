import express from "express";
import {
	getProductReviews,
	addReview,
} from "../controllers/reviewController.js";
import authUser from "../middleware/auth.js";
import { validateReview } from "../middleware/validate.js";

const reviewRouter = express.Router();

// Public read, authenticated write.
reviewRouter.get("/:productId", getProductReviews);
reviewRouter.post("/", authUser, validateReview, addReview);

export default reviewRouter;
