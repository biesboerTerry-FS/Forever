import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import razorpay from "razorpay";

// global variables
const currency = "usd";
const deliveryCharge = 10;

// Gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const razorpayInstance = new razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Placing orders using cash on delivery
const placeOrder = async (request, response) => {
	try {
		const { userId, items, amount, address } = request.body;
		const orderData = {
			userId,
			items,
			address,
			amount,
			paymentMethod: "COD",
			payment: false,
			date: Date.now(),
		};
		const newOrder = new orderModel(orderData);
		// saves order in the database
		await newOrder.save();
		// clear cart data after sending order
		await userModel.findByIdAndUpdate(userId, { cartData: {} });
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
		const { userId, items, amount, address } = request.body;
		const { origin } = request.headers;
		const orderData = {
			userId,
			items,
			address,
			amount,
			paymentMethod: "Stripe",
			payment: false,
			date: Date.now(),
		};
		const newOrder = new orderModel(orderData);
		await newOrder.save();

		const line_items = items.map((item) => ({
			price_data: {
				currency: currency,
				product_data: {
					name: item.name,
				},
				unit_amount: item.price * 100,
			},
			quantity: item.quantity,
		}));
		console.log(line_items);

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
		console.log(line_items);

		const session = await stripe.checkout.sessions.create({
			success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
			cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
			line_items,
			mode: "payment",
		});
		response.json({
			success: true,
			session_url: session.url,
		});
		console.log("Stripe payment successful");
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// Verify Stripe
const verifyStripe = async (request, response) => {
	const { orderId, success, userId } = request.body;
	try {
		if (success === "true") {
			await orderModel.findByIdAndUpdate(orderId, { payment: true });
			await userModel.findByIdAndUpdate(userId, { cartData: {} });
			response.json({
				success: true,
			});
			console.log(response.body);
		} else {
			await orderModel.findByIdAndDelete(orderId);
			response.json({ success: false });
		}
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// Placing orders using RazorPay
const placeOrderRazorpay = async (request, response) => {
	try {
		const { userId, items, amount, address } = request.body;
		const orderData = {
			userId,
			items,
			address,
			amount,
			paymentMethod: "Razorpay",
			payment: false,
			date: Date.now(),
		};
		const newOrder = new orderModel(orderData);
		await newOrder.save();

		const options = {
			amount: amount * 100,
			currency: currency.toUpperCase(),
			receipt: newOrder._id.toString(),
		};

		await razorpayInstance.orders.create(options, (error, order) => {
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
		const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
		if (orderInfo.status === "paid") {
			await orderModel.findByIdAndUpdate(orderInfo.receipt, {
				payment: true,
			});
			await userModel.findByIdAndUpdate(userId, { cartData: {} });
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
		await orderModel.findByIdAndUpdate(orderId, { status });
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
};
