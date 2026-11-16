import crypto from "node:crypto";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import { sendOrderConfirmationEmail } from "../utils/email.js";
import { sendExpoPushNotifications } from "../utils/push.js";
import Stripe from "stripe";
import razorpay from "razorpay";

// global variables
const currency = "usd";
const deliveryCharge = 10;

// Gateway clients are created lazily so the API can boot (and the rest of the
// store can work) before payment keys are configured.
let stripeClient = null;
const getStripe = () => {
	if (!process.env.STRIPE_SECRET_KEY) {
		throw new Error("Stripe is not configured");
	}
	if (!stripeClient) stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
	return stripeClient;
};

let razorpayClient = null;
const getRazorpay = () => {
	if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
		throw new Error("Razorpay is not configured");
	}
	if (!razorpayClient) {
		razorpayClient = new razorpay({
			key_id: process.env.RAZORPAY_KEY_ID,
			key_secret: process.env.RAZORPAY_KEY_SECRET,
		});
	}
	return razorpayClient;
};

// Never trust prices or totals sent by the browser. Look each product up in
// the catalogue, use its stored price and recompute the order total.
const buildOrderFromItems = async (clientItems) => {
	if (!Array.isArray(clientItems) || clientItems.length === 0) {
		throw new Error("Your cart is empty.");
	}

	const ids = [
		...new Set(clientItems.map((item) => item?._id).filter(Boolean)),
	];
	const products = await productModel.find({ _id: { $in: ids } });
	const byId = new Map(products.map((p) => [p._id.toString(), p]));

	const items = [];
	let subtotal = 0;

	for (const item of clientItems) {
		const product = byId.get(String(item?._id || ""));
		if (!product) {
			throw new Error("One of your items is no longer available.");
		}

		const quantity = Math.min(
			99,
			Math.max(1, parseInt(item.quantity, 10) || 1)
		);
		const price = Number(product.price);

		items.push({
			_id: product._id,
			name: product.name,
			price,
			image: product.image,
			size:
				typeof item.size === "string" ? item.size.slice(0, 20) : "",
			quantity,
		});
		subtotal += price * quantity;
	}

	return { items, amount: subtotal + deliveryCharge };
};

// Send the confirmation email once per order, even if both the browser
// redirect and the webhook report the same payment.
const notifyOrder = async (orderId) => {
	try {
		const order = await orderModel.findById(orderId);
		if (!order || order.emailSent) return;

		const email =
			order.address?.email ||
			(await userModel.findById(order.userId).select("email"))?.email;
		if (!email) return;

		await sendOrderConfirmationEmail({ to: email, order });

		order.emailSent = true;
		await order.save();
	} catch (error) {
		console.log("Order email skipped:", error.message);
	}
};

// Mark an order paid, clear the shopper's cart and send the receipt.
const fulfillPaidOrder = async (orderId, userId) => {
	if (!orderId) return null;

	const order = await orderModel.findByIdAndUpdate(
		orderId,
		{ payment: true },
		{ new: true }
	);
	if (!order) return null;

	if (userId) {
		await userModel.findByIdAndUpdate(userId, { cartData: {} });
	}
	await notifyOrder(orderId);
	return order;
};

// Placing orders using manual/card-on-delivery processing
const placeOrder = async (request, response) => {
	try {
		const { userId, items, address, paymentMethod } = request.body;
		const priced = await buildOrderFromItems(items);
		const normalizedMethod =
			paymentMethod === "Card" || paymentMethod === "COD"
				? paymentMethod
				: "Card";
		const orderData = {
			userId,
			items: priced.items,
			address,
			amount: priced.amount,
			paymentMethod: normalizedMethod,
			payment: false,
			date: Date.now(),
		};
		const newOrder = new orderModel(orderData);
		// saves order in the database
		await newOrder.save();
		// clear cart data after sending order
		await userModel.findByIdAndUpdate(userId, { cartData: {} });
		await notifyOrder(newOrder._id);
		response.json({
			success: true,
			message: "Order Placed",
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// Placing orders using Stripe
const placeOrderStripe = async (request, response) => {
	try {
		const { userId, items, address } = request.body;
		const { origin } = request.headers;
		const priced = await buildOrderFromItems(items);
		const orderData = {
			userId,
			items: priced.items,
			address,
			amount: priced.amount,
			paymentMethod: "Stripe",
			payment: false,
			date: Date.now(),
		};
		const newOrder = new orderModel(orderData);
		await newOrder.save();

		const line_items = priced.items.map((item) => ({
			price_data: {
				currency: currency,
				product_data: {
					name: item.name,
				},
				unit_amount: item.price * 100,
			},
			quantity: item.quantity,
		}));

		line_items.push({
			price_data: {
				currency: currency,
				product_data: {
					name: "Delivery Fee",
				},
				unit_amount: deliveryCharge * 100,
			},
			quantity: 1,
		});

		const session = await getStripe().checkout.sessions.create({
			success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
			cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
			customer_email: address?.email || undefined,
			metadata: {
				orderId: newOrder._id.toString(),
				userId: userId.toString(),
			},
			line_items,
			mode: "payment",
		});

		// Remember the session so the return page can verify the payment with
		// Stripe instead of trusting the URL.
		await orderModel.findByIdAndUpdate(newOrder._id, {
			paymentSessionId: session.id,
		});

		response.json({
			success: true,
			session_url: session.url,
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// Verify Stripe after the shopper returns from checkout. The query string is
// not proof of payment: retrieve the Checkout Session and ask Stripe.
const verifyStripe = async (request, response) => {
	const { orderId, success, userId } = request.body;
	try {
		if (!orderId) {
			return response.json({
				success: false,
				message: "Missing order id",
			});
		}

		const order = await orderModel.findById(orderId);
		if (!order) {
			return response.json({
				success: false,
				message: "Order not found",
			});
		}
		if (String(order.userId) !== String(userId)) {
			return response.status(403).json({
				success: false,
				message: "Not authorized",
			});
		}

		if (success === "true") {
			if (order.payment) return response.json({ success: true });

			if (!order.paymentSessionId) {
				return response.json({
					success: false,
					message: "Payment is still processing. Please refresh in a moment.",
				});
			}

			const session = await getStripe().checkout.sessions.retrieve(
				order.paymentSessionId
			);
			const paid =
				session.status === "complete" &&
				(session.payment_status === "paid" ||
					session.payment_status === "no_payment_required");

			if (!paid || session.metadata?.orderId !== String(orderId)) {
				return response.json({
					success: false,
					message: "Payment has not completed yet.",
				});
			}

			await fulfillPaidOrder(orderId, userId);
			return response.json({ success: true });
		}

		// Shopper cancelled: remove the unpaid order.
		if (!order.payment) await orderModel.findByIdAndDelete(orderId);
		return response.json({ success: false });
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// Stripe webhook: reliable payment confirmation even if the shopper closes
// the tab before returning to /verify.
const stripeWebhook = async (request, response) => {
	const signature = request.headers["stripe-signature"];
	const secret = process.env.STRIPE_WEBHOOK_SECRET;

	if (!secret) {
		return response.status(503).json({
			success: false,
			message: "Stripe webhook is not configured",
		});
	}

	let event;
	try {
		event = getStripe().webhooks.constructEvent(
			request.rawBody,
			signature,
			secret
		);
	} catch (error) {
		console.log("Stripe webhook signature failed:", error.message);
		return response.status(400).send(`Webhook Error: ${error.message}`);
	}

	if (
		event.type === "checkout.session.completed" ||
		event.type === "checkout.session.async_payment_succeeded"
	) {
		const session = event.data.object;
		const paid =
			session.payment_status === "paid" ||
			session.payment_status === "no_payment_required";
		if (paid) {
			await fulfillPaidOrder(
				session.metadata?.orderId,
				session.metadata?.userId
			);
		}
	}

	response.json({ received: true });
};

// Placing orders using RazorPay
const placeOrderRazorpay = async (request, response) => {
	try {
		const { userId, items, address } = request.body;
		const priced = await buildOrderFromItems(items);
		const orderData = {
			userId,
			items: priced.items,
			address,
			amount: priced.amount,
			paymentMethod: "Razorpay",
			payment: false,
			date: Date.now(),
		};
		const newOrder = new orderModel(orderData);
		await newOrder.save();

		const options = {
			amount: priced.amount * 100,
			currency: currency.toUpperCase(),
			receipt: newOrder._id.toString(),
			notes: {
				orderId: newOrder._id.toString(),
				userId: userId.toString(),
			},
		};

		await getRazorpay().orders.create(options, (error, order) => {
			if (error) {
				console.log(error);
				return response.json({
					success: false,
					message: error,
				});
			}
			response.json({
				success: true,
				order,
			});
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

const verifyRazorpay = async (request, response) => {
	try {
		const { userId, razorpay_order_id } = request.body;
		if (!razorpay_order_id) {
			return response.json({
				success: false,
				message: "Missing Razorpay order id",
			});
		}
		const orderInfo = await getRazorpay().orders.fetch(razorpay_order_id);
		const orderId = orderInfo.notes?.orderId || orderInfo.receipt;
		const order = orderId ? await orderModel.findById(orderId) : null;

		if (!order || String(order.userId) !== String(userId)) {
			return response.status(403).json({
				success: false,
				message: "Not authorized",
			});
		}

		if (orderInfo.status === "paid") {
			await fulfillPaidOrder(orderId, userId);
			response.json({
				success: true,
				message: "Payment Successful",
			});
		} else {
			response.json({
				success: false,
				message: " Payment Failed",
			});
		}
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// Razorpay webhook: verifies the HMAC signature and fulfils the order.
const razorpayWebhook = async (request, response) => {
	const signature = request.headers["x-razorpay-signature"];
	const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

	if (!secret) {
		return response.status(503).json({
			success: false,
			message: "Razorpay webhook is not configured",
		});
	}

	const expected = crypto
		.createHmac("sha256", secret)
		.update(request.rawBody)
		.digest("hex");

	const signatureBuffer = Buffer.from(String(signature || ""));
	const expectedBuffer = Buffer.from(expected);
	const validSignature =
		signatureBuffer.length === expectedBuffer.length &&
		crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

	if (!validSignature) {
		return response.status(400).json({
			success: false,
			message: "Invalid webhook signature",
		});
	}

	try {
		const payload = JSON.parse(request.rawBody.toString());
		const event = payload.event;
		const payment = payload.payload?.payment?.entity;

		if (event === "payment.captured" || event === "order.paid") {
			await fulfillPaidOrder(
				payment?.notes?.orderId || payment?.receipt,
				payment?.notes?.userId
			);
		}
		response.json({ received: true });
	} catch (error) {
		console.log("Razorpay webhook failed:", error.message);
		response.status(400).json({ success: false, message: "Invalid payload" });
	}
};

// All orders data for Admin Panel
const allOrders = async (request, response) => {
	try {
		const orders = await orderModel.find({});
		response.json({
			success: true,
			orders,
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// User order data for frontend
const userOrders = async (request, response) => {
	try {
		const { userId } = request.body;
		const orders = await orderModel.find({ userId });
		response.json({
			success: true,
			orders,
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// update order status from Admin panel
const updateStatus = async (request, response) => {
	try {
		const { orderId, status } = request.body;
		const order = await orderModel.findByIdAndUpdate(
			orderId,
			{ status },
			{ new: true }
		);
		if (!order) {
			return response.json({ success: false, message: "Order not found" });
		}

		// Best-effort push notification to the shopper's registered devices.
		try {
			const user = await userModel.findById(order.userId).select("pushTokens");
			const tokens = Array.isArray(user?.pushTokens) ? user.pushTokens : [];
			if (tokens.length > 0) {
				await sendExpoPushNotifications(
					tokens.map((to) => ({
						to,
						sound: "default",
						title: "Order update",
						body: `Order #${String(order._id).slice(-8).toUpperCase()} is now: ${status}`,
						data: { orderId: String(order._id), status },
					}))
				);
			}
		} catch (pushError) {
			console.log("Push notification skipped:", pushError.message);
		}

		response.json({
			success: true,
			message: "Status updated",
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

export {
	placeOrder,
	placeOrderStripe,
	placeOrderRazorpay,
	allOrders,
	userOrders,
	updateStatus,
	verifyStripe,
	verifyRazorpay,
	stripeWebhook,
	razorpayWebhook,
};
