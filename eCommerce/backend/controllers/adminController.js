import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import reviewModel from "../models/reviewModel.js";

// GET/POST /api/admin/stats (admin only)
// Powers the admin dashboard cards, status chart, top products and revenue.
const getStats = async (request, response) => {
	try {
		const [orders, products, users, reviews] = await Promise.all([
			orderModel.find({}).lean(),
			productModel.countDocuments(),
			userModel.countDocuments(),
			reviewModel.countDocuments(),
		]);

		const revenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
		const paidOrders = orders.filter((o) => o.payment).length;
		const pendingPayment = orders.filter((o) => !o.payment).length;

		const statusOrder = [
			"Order Placed",
			"Packing",
			"Shipped",
			"Out For Delivery",
			"Delivered",
		];
		const ordersByStatus = statusOrder.map((status) => ({
			status,
			count: orders.filter((o) => o.status === status).length,
		}));

		// Most-purchased products across all orders.
		const productTotals = new Map();
		for (const order of orders) {
			for (const item of order.items || []) {
				const key = item.name;
				const current = productTotals.get(key) || {
					name: key,
					quantity: 0,
					revenue: 0,
					image: item.image || "",
				};
				current.quantity += item.quantity || 0;
				current.revenue += (item.price || 0) * (item.quantity || 0);
				productTotals.set(key, current);
			}
		}
		const topProducts = [...productTotals.values()]
			.sort((a, b) => b.quantity - a.quantity)
			.slice(0, 5);

		const recentOrders = orders
			.sort((a, b) => b.date - a.date)
			.slice(0, 5)
			.map((o) => ({
				_id: o._id,
				amount: o.amount,
				status: o.status,
				paymentMethod: o.paymentMethod,
				payment: o.payment,
				date: o.date,
				customer:
					`${o.address?.firstName || ""} ${o.address?.lastName || ""}`.trim() ||
					"Guest",
				items: (o.items || []).length,
			}));

		// Revenue for the last 7 calendar days (simple sparkline data).
		const dayMs = 24 * 60 * 60 * 1000;
		const today = new Date();
		today.setHours(23, 59, 59, 999);
		const last7Days = Array.from({ length: 7 }, (_, i) => {
			const end = today.getTime() - i * dayMs;
			const start = end - dayMs + 1;
			const dayOrders = orders.filter(
				(o) => o.date >= start && o.date <= end
			);
			return {
				label: new Date(end).toLocaleDateString(undefined, {
					weekday: "short",
				}),
				revenue: dayOrders.reduce((s, o) => s + (o.amount || 0), 0),
				orders: dayOrders.length,
			};
		}).reverse();

		response.json({
			success: true,
			stats: {
				revenue,
				orders: orders.length,
				products,
				users,
				reviews,
				paidOrders,
				pendingPayment,
				ordersByStatus,
				topProducts,
				recentOrders,
				last7Days,
			},
		});
	} catch (error) {
		console.log(error);
		response.json({ success: false, message: error.message });
	}
};

export { getStats };
