import express from "express";
import authUser from "../middleware/auth.js";
import { capBodyStrings, fields } from "../middleware/validate.js";
import {
	addAddress,
	deleteAddress,
	getAddresses,
	setDefaultAddress,
	updateAddress,
} from "../controllers/addressController.js";

const addressRules = {
	label: { max: 60 },
	firstName: { max: 80 },
	lastName: { max: 80 },
	email: { max: 254, email: true },
	phone: { max: 40 },
	line1: { required: true, max: 200, min: 1, message: "Street address is required." },
	line2: { max: 200 },
	city: { required: true, max: 100, min: 1, message: "City is required." },
	state: { max: 100 },
	zip: { required: true, max: 20, min: 1, message: "Zip / postal code is required." },
	country: { required: true, max: 100, min: 1, message: "Country is required." },
};

// PATCH may contain only the fields being changed.
const patchRules = Object.fromEntries(
	Object.entries(addressRules).map(([name, rule]) => [name, { ...rule, required: false }])
);

const addressRouter = express.Router();

addressRouter.use(authUser);

addressRouter.get("/", getAddresses);
addressRouter.post("/", fields(addressRules), capBodyStrings(300), addAddress);
addressRouter.patch("/:id", fields(patchRules), capBodyStrings(300), updateAddress);
addressRouter.patch("/:id/default", setDefaultAddress);
addressRouter.delete("/:id", deleteAddress);

export default addressRouter;
