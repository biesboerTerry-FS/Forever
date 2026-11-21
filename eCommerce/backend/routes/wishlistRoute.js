import express from "express";
import {
	toggleWishlist,
	getWishlist,
} from "../controllers/wishlistController.js";
import authUser from "../middleware/auth.js";
import { validateWishlist } from "../middleware/validate.js";

const wishlistRouter = express.Router();

wishlistRouter.post("/toggle", authUser, validateWishlist, toggleWishlist);
wishlistRouter.post("/get", authUser, getWishlist);

export default wishlistRouter;
