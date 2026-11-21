import express from "express";
import {
	addProduct,
	listProduct,
	removeProduct,
	singleProduct,
	updateProduct,
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
import { capBodyStrings, requireId } from "../middleware/validate.js";

const productRouter = express.Router();

productRouter.post(
	"/add",
	adminAuth,
	upload.fields([
		{ name: "image1", maxCount: 1 },
		{ name: "image2", maxCount: 1 },
		{ name: "image3", maxCount: 1 },
		{ name: "image4", maxCount: 1 },
		{ name: "image5", maxCount: 1 },
	]),
	capBodyStrings(1000),
	addProduct
);
productRouter.post("/remove", adminAuth, requireId, removeProduct);
productRouter.post("/update", adminAuth, capBodyStrings(1000), updateProduct);
// Public browse routes stay open.
productRouter.get("/list", listProduct);
productRouter.post("/single", singleProduct);

export default productRouter;
