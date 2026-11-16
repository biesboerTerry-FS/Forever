import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const canEditOrder = (status) => {
	const s = String(status || "").trim().toLowerCase();
	return s === "order placed" || s === "ordered" || s === "packing";
};

const Orders = ({ token }) => {
	const [orders, setOrders] = useState([]);
	const [editingId, setEditingId] = useState(null);
	const [editForm, setEditForm] = useState(null);
	const [saving, setSaving] = useState(false);

	const fetchAllOrders = async () => {
		if (!token) return null;
		try {
			const response = await axios.post(
				backendUrl + "/api/order/list",
				{},
				{ headers: { token } }
			);
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
				{ orderId, status: event.target.value },
				{ headers: { token } }
			);
			if (response.data.success) {
				await fetchAllOrders();
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		}
	};

	const startEdit = (order) => {
		setEditingId(order._id);
		setEditForm({
			address: {
				firstName: order.address?.firstName || "",
				lastName: order.address?.lastName || "",
				email: order.address?.email || "",
				street: order.address?.street || "",
				city: order.address?.city || "",
				state: order.address?.state || "",
				zipcode: order.address?.zipcode || "",
				country: order.address?.country || "",
				phone: order.address?.phone || "",
			},
			payment: !!order.payment,
		});
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditForm(null);
	};

	const saveEdit = async (orderId) => {
		try {
			setSaving(true);
			const response = await axios.post(
				backendUrl + "/api/order/update",
				{ orderId, address: editForm.address, payment: editForm.payment },
				{ headers: { token } }
			);
			if (response.data.success) {
				toast.success(response.data.message || "Order updated.");
				cancelEdit();
				await fetchAllOrders();
			} else {
				toast.error(response.data.message || "Failed to update order.");
			}
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		} finally {
			setSaving(false);
		}
	};

	useEffect(() => {
		fetchAllOrders();
	}, [token]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div>
			<h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-100">Orders</h3>
			<div>
				{orders.map((order) => {
					const editable = canEditOrder(order.status);
					const isEditing = editingId === order._id;
					return (
						<div
							className="p-5 my-3 text-xs bg-white rounded-2xl shadow-sm sm:text-sm text-gray-700 md:p-6 dark:bg-gray-900 dark:text-gray-300 dark:shadow-none dark:ring-1 dark:ring-gray-800"
							key={order._id}
						>
							<div className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start">
								<img className="w-12 dark:invert" src={assets.parcel_icon} alt="Parcel" />
								<div>
									<div>
										{order.items.map((item, index) => (
											<p className="py-1.5" key={index}>
												{item.name} x {item.quantity} <span>{item.size}</span>
												{index === order.items.length - 1 ? "" : ","}
											</p>
										))}
									</div>
									<p className="mt-3 mb-2 font-medium">
										{(order.address?.firstName || "") + " " + (order.address?.lastName || "")}
									</p>
									<div>
										<p>{(order.address?.street || "") + ","}</p>
										<p>
											{(order.address?.city || "") + ", " + (order.address?.state || "") + ", " + (order.address?.country || "") + ", " + (order.address?.zipcode || "")}
										</p>
									</div>
									<p>{order.address?.phone}</p>
									{order.address?.email && <p className="text-gray-500 dark:text-gray-400">{order.address.email}</p>}
								</div>
								<div>
									<p className="text-sm sm:text-[15px]">Order #: {order._id}</p>
									<p className="text-sm sm:text-[15px]">Items: {order.items.length}</p>
									<p className="mt-3">Method: {order.paymentMethod}</p>
									<p>Payment: {order.payment ? "Done" : "Pending"}</p>
									<p>Date: {new Date(order.date).toLocaleDateString()}</p>
								</div>
								<p className="text-sm sm:text-[15px]">
									{currency}
									{order.amount}
								</p>
								<div className="flex flex-col gap-2">
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
									{editable ? (
										<button
											type="button"
											onClick={() => (isEditing ? cancelEdit() : startEdit(order))}
											className="px-3 py-2 text-sm text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 dark:text-blue-300 dark:border-blue-900/50 dark:hover:bg-blue-950/30"
										>
											{isEditing ? "Close edit" : "Edit order"}
										</button>
									) : (
										<span className="text-xs text-gray-400 dark:text-gray-500">Editing unavailable for this status</span>
									)}
								</div>
							</div>

							{isEditing && editForm && (
								<div className="grid gap-3 p-4 mt-4 border border-gray-200 rounded-xl md:grid-cols-2 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40">
									{[
										["firstName", "First name"],
										["lastName", "Last name"],
										["email", "Email"],
										["phone", "Phone"],
										["street", "Street"],
										["city", "City"],
										["state", "State"],
										["zipcode", "Zipcode"],
										["country", "Country"],
									].map(([key, label]) => (
										<label key={key} className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
											{label}
											<input
												className="px-3 py-2 text-sm border rounded dark:bg-gray-900 dark:border-gray-700"
												value={editForm.address[key] || ""}
												onChange={(e) =>
													setEditForm({
														...editForm,
														address: { ...editForm.address, [key]: e.target.value },
													})
												}
											/>
										</label>
									))}
									<label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 md:col-span-2">
										<input
											type="checkbox"
											checked={editForm.payment}
											onChange={(e) => setEditForm({ ...editForm, payment: e.target.checked })}
										/>
										Payment received
									</label>
									<div className="flex gap-2 md:col-span-2">
										<button
											type="button"
											disabled={saving}
											onClick={() => saveEdit(order._id)}
											className="px-4 py-2 text-sm text-white bg-black rounded disabled:opacity-60 dark:bg-white dark:text-gray-900"
										>
											{saving ? "Saving..." : "Save order"}
										</button>
										<button
											type="button"
											onClick={cancelEdit}
											className="px-4 py-2 text-sm border rounded dark:border-gray-700"
										>
											Cancel
										</button>
									</div>
									<p className="text-xs text-gray-500 md:col-span-2 dark:text-gray-400">
										Editable only while status is Order Placed or Packing (address/payment details).
									</p>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Orders;
