import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
	const [orders, setOrders] = useState([]);
	const fetchAllOrders = async () => {
		if (!token) {
			return null;
		}
		try {
			const response = await axios.post(
				backendUrl + "/api/order/list",
				{},
				{ headers: { token } }
			);
			console.log(response.data);

			if (response.data.success) {
				setOrders(response.data.orders.reverse());
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			toast.error(error.message);
		}
	};

	const statusHandler = async (event, orderId) => {
		try {
			const response = await axios.post(
				backendUrl + "/api/order/status",
				{
					orderId,
					status: event.target.value,
				},
				{ headers: { token } }
			);
			if (response.data.success) {
				await fetchAllOrders();
			}
		} catch (error) {
			console.log(error);
			// toast.error(response.data.message);
		}
	};

	useEffect(() => {
		fetchAllOrders();
	}, [token]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div>
			<h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-100">Orders</h3>
			<div>
				{orders.map((order, index) => (
					<div
						className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start p-5 my-3 text-xs bg-white rounded-2xl shadow-sm sm:text-sm text-gray-700 md:p-6 dark:bg-gray-900 dark:text-gray-300 dark:shadow-none dark:ring-1 dark:ring-gray-800"
						key={index}
					>
						<img
							className="w-12 dark:invert"
							src={assets.parcel_icon}
							alt="Parcel"
						/>
						<div>
							<div>
								{order.items.map((item, index) => {
									if (index === order.items.length - 1) {
										return (
											<p className="py-1.5" key={index}>
												{item.name} x {item.quantity}
												<span>{item.size}</span>
											</p>
										);
									} else {
										return (
											<p className="py-1.5" key={index}>
												{item.name} x {item.quantity}
												<span>{item.size}</span> ,
											</p>
										);
									}
								})}
							</div>
			<p className="mb-2 font-medium mt-3">
								{order.address.firstName + " " + order.address.lastName}
							</p>
							<div>
								<p>{order.address.street + ","}</p>
								<p>
									{order.address.city +
										", " +
										order.address.state +
										", " +
										order.address.country +
										", " +
										order.address.zipcode}
								</p>
							</div>
							<p>{order.address.phone}</p>
						</div>
						<div>
							<p className="text-sm sm:text-[15px]">
								Order #: {order._id}
							</p>
							<p className="text-sm sm:text-[15px]">
								Items: {order.items.length}
							</p>
							<p className="mt-3">Methods: {order.paymentMethod}</p>
							<p>Payment: {order.payment ? "Done" : "Pending"}</p>
							<p>Date: {new Date(order.date).toLocaleDateString()}</p>
						</div>
						<p className="text-sm sm:text-[15px]">
							{currency}
							{order.amount}
						</p>
						<select
							onChange={(event) => statusHandler(event, order._id)}
							value={order.status}
							className="p-2 text-sm font-medium bg-white border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
						>
							<option value="Order Placed">Order Placed</option>
							<option value="Packing">Packing</option>
							<option value="Shipped">Shipped</option>
							<option value="Out For Delivery">Out For Delivery</option>
							<option value="Delivered">Delivered</option>
						</select>
					</div>
				))}
			</div>
		</div>
	);
};

export default Orders;
