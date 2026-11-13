import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import OrderTimeline from "../components/OrderTimeline";
import { firstImage } from "../utils/image";
import axios from "axios";

const Orders = () => {
	const { backendUrl, token, currency, navigate } = useContext(ShopContext);
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	const loadOrderData = async () => {
		try {
			if (!token) {
				setLoading(false);
				return null;
			}
			setLoading(true);
			const response = await axios.post(
				backendUrl + "/api/order/userorders",
				{},
				{ headers: { token } }
			);
			if (response.data.success) {
				// Newest orders first.
				setOrders([...response.data.orders].reverse());
			}
		} catch (error) {
			console.error("Error loading order data:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadOrderData();
	}, [token]); // eslint-disable-line react-hooks/exhaustive-deps

	if (!token) {
		return (
			<div className="pt-16 border-t">
				<div className="text-2xl">
					<Title text1={"MY"} text2={"ORDERS"} />
				</div>
				<div className="py-24 text-center text-gray-500 dark:text-gray-400">
					<p className="text-lg font-medium text-gray-700 dark:text-gray-200">
						Log in to see your orders
					</p>
					<p className="mt-2">
						Your order history and live delivery status appear here.
					</p>
					<button
						onClick={() => navigate("/login")}
						className="px-8 py-3 mt-6 text-sm text-white dark:text-gray-900 bg-black dark:bg-white"
					>
						SIGN IN
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="pt-16 border-t">
			<div className="text-2xl">
				<Title text1={"MY"} text2={"ORDERS"} />
			</div>

			{loading ? (
				<p className="py-16 text-center text-gray-500 dark:text-gray-400">Loading your orders…</p>
			) : orders.length === 0 ? (
				<div className="py-24 text-center text-gray-500 dark:text-gray-400">
					<p className="text-lg font-medium text-gray-700 dark:text-gray-200">
						You haven't placed an order yet
					</p>
					<p className="mt-2">When you do, you'll be able to track it here.</p>
					<button
						onClick={() => navigate("/collection")}
						className="px-8 py-3 mt-6 text-sm text-white dark:text-gray-900 bg-black dark:bg-white"
					>
						START SHOPPING
					</button>
				</div>
			) : (
				<div className="flex flex-col gap-8 pb-10">
					{orders.map((order) => (
						<div key={order._id} className="border">
							{/* Order header */}
							<div className="flex flex-col gap-2 px-4 py-3 text-sm bg-gray-50 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<p className="font-medium text-gray-800 dark:text-gray-100">
										Order #{order._id.slice(-8).toUpperCase()}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										Placed {new Date(order.date).toDateString()}
									</p>
								</div>
								<div className="text-xs text-gray-500 dark:text-gray-400 sm:text-right">
									<p>
										Payment: {order.paymentMethod}
										<span
											className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
												order.payment
													? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
													: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300"
											}`}
										>
											{order.payment ? "Paid" : "Pending"}
										</span>
									</p>
									<p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-100">
										Total: {currency}
										{order.amount}
									</p>
								</div>
							</div>

							{/* Tracking timeline */}
							<div className="px-4 pt-2 pb-1 border-t">
								<OrderTimeline status={order.status} />
							</div>

							{/* Items */}
							<div className="flex flex-col divide-y">
								{order.items.map((item, index) => (
									<div
										key={`${item._id}-${index}`}
										className="flex items-start gap-4 px-4 py-4 text-sm"
									>
										<img
											className="w-16 sm:w-20"
											src={firstImage(item.image, 160)}
											alt={item.name}
											loading="lazy"
											decoding="async"
											onError={(e) => {
												e.currentTarget.onerror = null;
												e.currentTarget.style.visibility = "hidden";
											}}
										/>
										<div className="flex-1">
											<p className="font-medium sm:text-base">{item.name}</p>
											<div className="flex flex-wrap items-center gap-3 mt-1 text-gray-600 dark:text-gray-300">
												<p className="text-base text-gray-800 dark:text-gray-100">
													{currency}
													{item.price}
												</p>
												<p>Quantity: {item.quantity}</p>
												<p>Size: {item.size}</p>
											</div>
										</div>
									</div>
								))}
							</div>

							<div className="flex flex-col gap-3 px-4 py-3 text-sm border-t sm:flex-row sm:items-center sm:justify-between">
								<p className="text-gray-500 dark:text-gray-400">
									Status:{" "}
									<span className="font-medium text-gray-800 dark:text-gray-100">
										{order.status}
									</span>
								</p>
								<button
									onClick={loadOrderData}
									className="px-4 py-2 text-sm font-medium border rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800"
								>
									Track Order
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Orders;
