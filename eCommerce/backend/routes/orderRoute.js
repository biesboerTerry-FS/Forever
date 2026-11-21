import express from "express";
import {
	placeOrder,
	placeOrderStripe,
	placeOrderRazorpay,
	allOrders,
	userOrders,
	updateStatus,
	updateOrder,
	verifyStripe,
	verifyRazorpay,
	stripeWebhook,
	razorpayWebhook,
	updateOrderStatus,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";
import staffAuth from "../middleware/staffAuth.js";
import {
	fields,
	validateOrder,
	validateStripeVerification,
	validateRazorpayVerification,
	validateOrderStatus,
	validateOrderEdit,
} from "../middleware/validate.js";

const orderRouter = express.Router();

// Admin features
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, validateOrderStatus, updateStatus);
orderRouter.post("/update", adminAuth, validateOrderEdit, updateOrder);

// Payment features
orderRouter.post("/place", authUser, validateOrder, placeOrder);
orderRouter.post("/stripe", authUser, validateOrder, placeOrderStripe);
orderRouter.post("/razorpay", authUser, validateOrder, placeOrderRazorpay);

// User features
orderRouter.post("/userorders", authUser, userOrders);

// Verify payment
orderRouter.post(
	"/verifyStripe",
	authUser,
	validateStripeVerification,
	verifyStripe
);
orderRouter.post(
	"/verifyRazorpay",
	authUser,
	validateRazorpayVerification,
	verifyRazorpay
);

// Payment provider webhooks (no auth token; signatures are verified instead)
orderRouter.post("/webhook/stripe", stripeWebhook);
orderRouter.post("/webhook/razorpay", razorpayWebhook);

// Shared staff endpoints (admin or employee). Used by both portals.
const validateStatusPatch = fields({
	status: { required: true, max: 40, message: "A status is required." },
});
orderRouter.post("/staff", staffAuth, allOrders);
orderRouter.patch("/:id/status", staffAuth, validateStatusPatch, updateOrderStatus);

export default orderRouter;
