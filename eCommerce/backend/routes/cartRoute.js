import express from "express";
import {
	addToCart,
	getUserCart,
	updateCart,
} from "../controllers/cartController.js";
import authUser from "../middleware/auth.js";
import { validateCartAdd, validateCartUpdate } from "../middleware/validate.js";

const cartRouter = express.Router();

cartRouter.post("/get", authUser, getUserCart);
cartRouter.post("/add", authUser, validateCartAdd, addToCart);
cartRouter.post("/update", authUser, validateCartUpdate, updateCart);

export default cartRouter;
