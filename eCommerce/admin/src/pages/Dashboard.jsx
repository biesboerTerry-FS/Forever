import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import LatestBulletin from "../components/LatestBulletin";

const StatCard = ({ label, value, hint }) => (
	<div className="p-5 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
		<p className="text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase">
			{label}
		</p>
		<p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">{value}</p>
		{hint && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
	</div>
);

const STATUS_COLORS = {
	"Order Placed": "bg-yellow-400",
	Packing: "bg-orange-400",
	Shipped: "bg-blue-400",
	"Out For Delivery": "bg-indigo-400",
	Delivered: "bg-green-500",
};

const Dashboard = ({ token }) => {
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);

	const fetchStats = async () => {
		try {
			setLoading(true);
			const response = await axios.post(
				backendUrl + "/api/admin/stats",
				{},
				{ headers: { token } }
			);
			if (response.data.success) {
				setStats(response.data.stats);
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (token) fetchStats();
	}, [token]); // eslint-disable-line react-hooks/exhaustive-deps

	if (loading) {
		return (
			<div className="py-20 text-center text-gray-500 dark:text-gray-400 dark:text-gray-500">
				Loading dashboard…
			</div>
		);
	}

	if (!stats) {
		return (
			<div className="py-20 text-center text-gray-500 dark:text-gray-400 dark:text-gray-500">
				Could not load dashboard data.
			</div>
		);
	}

	const maxDailyRevenue = Math.max(
		1,
		...stats.last7Days.map((day) => day.revenue)
	);
	const maxStatus = Math.max(1, ...stats.ordersByStatus.map((s) => s.count));

	return (
		<div className="pb-10">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Dashboard</h3>
				<button
					onClick={fetchStats}
					className="px-4 py-1.5 text-xs font-medium bg-white rounded-full shadow-sm hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
				>
					Refresh
				</button>
			</div>

			{/* Newest active bulletin (demo mode, localStorage) */}
			<LatestBulletin />

			{/* Headline stats */}
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<StatCard
					label="Total revenue"
					value={`${currency}${stats.revenue.toFixed(2)}`}
					hint={`${stats.paidOrders} paid · ${stats.pendingPayment} pending`}
				/>
				<StatCard
					label="Orders"
					value={stats.orders}
					hint={`${stats.ordersByStatus.find((s) => s.status === "Delivered")?.count || 0} delivered`}
				/>
				<StatCard
					label="Products"
					value={stats.products}
					hint="Live in the catalog"
				/>
				<StatCard
					label="Customers"
					value={stats.users}
					hint={`${stats.reviews} product reviews`}
				/>
			</div>

			{/* Pending fulfilment queue */}
			<div data-testid="pending-orders-widget" className="p-5 mt-4 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
				<div className="flex items-center justify-between">
					<p className="text-sm font-medium text-gray-800 dark:text-gray-100">Pending orders</p>
					<a href="/orders" className="text-xs font-medium text-pink-600 hover:underline dark:text-pink-400">View all orders →</a>
				</div>
				{(stats.pendingOrders || []).length === 0 ? (
					<p className="mt-3 text-xs text-gray-400 dark:text-gray-500">No orders waiting for fulfilment.</p>
				) : (
					<div className="grid gap-2 mt-3 sm:grid-cols-2 xl:grid-cols-3">
						{stats.pendingOrders.map((order) => (
							<div key={order._id} className="flex items-center justify-between gap-3 px-3 py-2 text-xs rounded-lg bg-gray-50 dark:bg-gray-800/60">
								<div className="min-w-0">
									<p className="font-medium text-gray-800 dark:text-gray-100 truncate">{order.customer}</p>
									<p className="text-gray-500 dark:text-gray-400">{order.items} items · {new Date(order.date).toLocaleDateString()}</p>
								</div>
								<div className="text-right">
									<p className="font-medium text-gray-800 dark:text-gray-100">{currency}{order.amount}</p>
									<p className="text-gray-500 dark:text-gray-400">{order.status}</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="grid gap-4 mt-4 lg:grid-cols-2">
				{/* Revenue last 7 days */}
				<div className="p-5 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
					<p className="mb-4 text-sm font-medium text-gray-800 dark:text-gray-100 dark:text-gray-100">
						Revenue — last 7 days
					</p>
					<div className="flex items-end justify-between h-40 gap-2">
						{stats.last7Days.map((day) => (
							<div
								key={day.label}
								className="flex flex-col items-center flex-1 gap-2"
							>
								<div className="flex items-end justify-center w-full h-32">
									<div
										title={`${currency}${day.revenue.toFixed(2)} · ${day.orders} orders`}
										className="w-full max-w-[28px] bg-gray-800 dark:bg-gray-200 rounded-t"
										style={{
											height: `${Math.max(
												4,
												(day.revenue / maxDailyRevenue) * 100
											)}%`,
										}}
									/>
								</div>
								<p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-500">{day.label}</p>
							</div>
						))}
					</div>
					<p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
						Total: {currency}
						{stats.last7Days
							.reduce((sum, day) => sum + day.revenue, 0)
							.toFixed(2)}{" "}
						this week
					</p>
				</div>

				{/* Orders by status */}
				<div className="p-5 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
					<p className="mb-4 text-sm font-medium text-gray-800 dark:text-gray-100 dark:text-gray-100">
						Orders by status
					</p>
					<div className="flex flex-col gap-3">
						{stats.ordersByStatus.map((row) => (
							<div key={row.status}>
								<div className="flex justify-between mb-1 text-xs text-gray-600 dark:text-gray-300">
									<span>{row.status}</span>
									<span className="font-medium">{row.count}</span>
								</div>
								<div className="h-2 overflow-hidden bg-gray-100 dark:bg-gray-800 rounded">
									<div
										className={`h-full ${
											STATUS_COLORS[row.status] || "bg-gray-400"
										}`}
										style={{ width: `${(row.count / maxStatus) * 100}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="grid gap-4 mt-4 lg:grid-cols-2">
				{/* Top products */}
				<div className="p-5 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
					<p className="mb-4 text-sm font-medium text-gray-800 dark:text-gray-100 dark:text-gray-100">
						Top products
					</p>
					{stats.topProducts.length === 0 ? (
						<p className="text-xs text-gray-400 dark:text-gray-500">No sales yet.</p>
					) : (
						<div className="flex flex-col gap-3">
							{stats.topProducts.map((product, index) => (
								<div key={product.name} className="flex items-center gap-3">
									<span className="w-4 text-xs text-gray-400 dark:text-gray-500">
										{index + 1}
									</span>
									<img
										className="object-cover w-10 h-10 rounded-lg"
										src={product.image}
										alt={product.name}
									/>
									<div className="flex-1 min-w-0">
										<p className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate">
											{product.name}
										</p>
										<p className="text-[11px] text-gray-400 dark:text-gray-500">
											{product.quantity} sold
										</p>
									</div>
									<p className="text-xs font-medium text-gray-700 dark:text-gray-200">
										{currency}
										{product.revenue.toFixed(2)}
									</p>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Recent orders */}
				<div className="p-5 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
					<p className="mb-4 text-sm font-medium text-gray-800 dark:text-gray-100 dark:text-gray-100">
						Recent orders
					</p>
					{stats.recentOrders.length === 0 ? (
						<p className="text-xs text-gray-400 dark:text-gray-500">No orders yet.</p>
					) : (
						<div className="flex flex-col gap-1">
							{stats.recentOrders.map((order) => (
								<div
									key={order._id}
									className="flex items-center justify-between gap-3 px-2 py-2 text-xs rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60"
								>
									<div className="min-w-0">
										<p className="font-medium text-gray-800 dark:text-gray-100 truncate">
											{order.customer}
										</p>
										<p className="text-[11px] text-gray-400 dark:text-gray-500">
											{order.items} {order.items === 1 ? "item" : "items"} ·{" "}
											{new Date(order.date).toLocaleDateString()}
										</p>
									</div>
									<div className="text-right">
										<p className="font-medium text-gray-800 dark:text-gray-100">
											{currency}
											{order.amount}
										</p>
										<p className="text-[11px] text-gray-400 dark:text-gray-500">
											{order.status}
										</p>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
