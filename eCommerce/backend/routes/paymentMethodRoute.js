import express from "express";
import authUser from "../middleware/auth.js";
import { capBodyStrings, fields } from "../middleware/validate.js";
import {
	addPaymentMethod,
	deletePaymentMethod,
	getPaymentMethods,
	updatePaymentMethod,
} from "../controllers/paymentMethodController.js";

// Masked demo metadata only — the validator refuses anything longer than four
// digits, and the controller explicitly rejects full-card/CVC field names.
const cardRules = {
	label: { max: 60 },
	brand: {
		required: true,
		max: 20,
		pattern: /^(Visa|Mastercard|Amex|Discover)$/,
		message: "Choose a supported demo card type.",
	},
	last4: {
		required: true,
		max: 4,
		min: 4,
		pattern: /^\d{4}$/,
		message: "Enter only the last 4 digits of the demo card.",
	},
	exp: { max: 8 },
};

const patchRules = Object.fromEntries(
	Object.entries(cardRules).map(([name, rule]) => [name, { ...rule, required: false }])
);

const paymentMethodRouter = express.Router();

paymentMethodRouter.use(authUser);

paymentMethodRouter.get("/", getPaymentMethods);
paymentMethodRouter.post("/", fields(cardRules), capBodyStrings(300), addPaymentMethod);
paymentMethodRouter.patch("/:id", fields(patchRules), capBodyStrings(300), updatePaymentMethod);
paymentMethodRouter.delete("/:id", deletePaymentMethod);

export default paymentMethodRouter;
