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

const orderRouter = express.Router();

// Admin features
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/update", adminAuth, updateOrder);

// Payment features
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.post("/razorpay", authUser, placeOrderRazorpay);

// User features
orderRouter.post("/userorders", authUser, userOrders);

// Verify payment
orderRouter.post("/verifyStripe", authUser, verifyStripe);
orderRouter.post("/verifyRazorpay", authUser, verifyRazorpay);

// Payment provider webhooks (no auth token; signatures are verified instead)
orderRouter.post("/webhook/stripe", stripeWebhook);
orderRouter.post("/webhook/razorpay", razorpayWebhook);

export default orderRouter;
