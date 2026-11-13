import express from "express";
import {
	getProductReviews,
	addReview,
} from "../controllers/reviewController.js";
import authUser from "../middleware/auth.js";

const reviewRouter = express.Router();

reviewRouter.get("/:productId", getProductReviews);
reviewRouter.post("/", authUser, addReview);

export default reviewRouter;
