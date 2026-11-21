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
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";
import {
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

export default orderRouter;
