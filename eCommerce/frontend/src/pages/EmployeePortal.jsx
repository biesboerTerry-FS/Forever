import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import {
	clearEmployeeSession,
	getEmployeeMe,
	readEmployeeSession,
	updateEmployeeMe,
} from "../utils/employeeSession";
import {
	applyOrderStatusOverrides,
	formatDate,
	isPending,
	loadDemoOrders,
	loadMessages,
	loadScheduleRequests,
	ORDER_STAGES,
	saveMessages,
	saveOrderStatusOverride,
	saveScheduleRequests,
	stageLabel,
} from "../utils/ops";

const AVAILABILITY_KEY = "forever-employee-availability";

const formatShiftDate = (value) => {
	const date = new Date(`${value}T00:00:00`);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString(undefined, {
		weekday: "short",
		month: "short",
		day: "numeric",
	});
};

const Field = ({ label, value, testId }) => (
	<div className="py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
		<dt className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
			{label}
		</dt>
		<dd className="mt-1 text-sm text-gray-900 dark:text-gray-100" data-testid={testId}>
			{value || "Not provided"}
		</dd>
	</div>
);

const TABS = [
	{ key: "overview", label: "Dashboard" },
	{ key: "orders", label: "Orders" },
	{ key: "messages", label: "Messages" },
	{ key: "schedule", label: "Schedule" },
];

const EmployeePortal = () => {
	const { backendUrl, navigate } = useContext(ShopContext);
	const [params, setParams] = useSearchParams();
	const tab = TABS.some((item) => item.key === params.get("tab"))
		? params.get("tab")
		: "overview";

	const [session, setSession] = useState(readEmployeeSession);
	const [employee, setEmployee] = useState(() => session?.employee || null);
	const [schedule, setSchedule] = useState([]);
	const [offline, setOffline] = useState(Boolean(session?.offline));
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [form, setForm] = useState({ name: "", address: "", phone: "", email: "" });

	const [orders, setOrders] = useState(() => applyOrderStatusOverrides(loadDemoOrders()));
	const [messages, setMessages] = useState(loadMessages);
	const [requests, setRequests] = useState(loadScheduleRequests);
	const [selectedMessageId, setSelectedMessageId] = useState(null);
	const [available, setAvailable] = useState(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(AVAILABILITY_KEY) || "null");
			return typeof saved === "boolean" ? saved : true;
		} catch {
			return true;
		}
	});
	const [showRequestForm, setShowRequestForm] = useState(null);
	const [requestForm, setRequestForm] = useState({ date: "", endDate: "", reason: "" });
	const [messageForm, setMessageForm] = useState({ subject: "", body: "" });

	useEffect(() => {
		if (!session) {
			setLoading(false);
			return;
		}
		let active = true;
		const load = async () => {
			try {
				const result = await getEmployeeMe(backendUrl, session);
				if (!active) return;
				setEmployee(result.employee);
				setSchedule(result.schedule);
				setOffline(result.offline);
				setAvailable(result.employee?.available !== false);
				setSession({ ...session, employee: result.employee, offline: result.offline });

				const headers = { token: session.token };
				if (session.token && backendUrl) {
					try {
						const response = await axios.post(
							`${backendUrl}/api/order/staff`,
							{},
							{ headers }
						);
						if (response.data?.success && Array.isArray(response.data.orders)) {
							setOrders(applyOrderStatusOverrides(response.data.orders));
						}
					} catch {
						// keep the seeded local orders
					}
					try {
						const response = await axios.get(`${backendUrl}/api/messages`, { headers });
						if (response.data?.success && Array.isArray(response.data.messages)) {
							const list = response.data.messages.map((item) => ({
								...item,
								id: item.id || item._id,
							}));
							setMessages(list);
							saveMessages(list);
						}
					} catch {
						// keep local demo messages
					}
					try {
						const response = await axios.get(`${backendUrl}/api/employee/requests`, { headers });
						if (response.data?.success && Array.isArray(response.data.requests)) {
							setRequests(response.data.requests);
							saveScheduleRequests(response.data.requests);
							if (typeof response.data.available === "boolean") {
								setAvailable(response.data.available);
							}
						}
					} catch {
						// keep local demo requests
					}
				}
			} finally {
				if (active) setLoading(false);
			}
		};
		load();
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [backendUrl]);

	const startEditing = () => {
		setForm({
			name: employee?.name || "",
			address: employee?.address || "",
			phone: employee?.phone || "",
			email: employee?.email || "",
		});
		setEditing(true);
	};

	const handleChange = (event) => {
		setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		try {
			const result = await updateEmployeeMe(backendUrl, session, form);
			setEmployee(result.employee);
			setOffline(result.offline);
			setSession({ ...session, employee: result.employee, offline: result.offline });
			setEditing(false);
			toast.success(result.offline ? "Saved on this device (offline demo)." : result.message);
		} catch (error) {
			toast.error(error?.message || "Could not save your details.");
		}
	};

	const signOut = () => {
		clearEmployeeSession();
		setSession(null);
		setEmployee(null);
		setSchedule([]);
		setEditing(false);
		navigate("/login");
	};

	const updateOrderStatus = async (orderId, status) => {
		saveOrderStatusOverride(orderId, status);
		setOrders((current) =>
			current.map((order) =>
				String(order._id) === String(orderId) ? { ...order, status } : order
			)
		);
		if (session?.token && backendUrl && !String(orderId).startsWith("demo-")) {
			try {
				await axios.patch(
					`${backendUrl}/api/order/${orderId}/status`,
					{ status },
					{ headers: { token: session.token } }
				);
			} catch {
				// local override keeps the change visible
			}
		}
		toast.success(`Order marked ${stageLabel(status).toLowerCase()}.`);
	};

	const openMessage = async (message) => {
		setSelectedMessageId(message.id);
		if (message.read) return;
		const next = messages.map((item) =>
			item.id === message.id ? { ...item, read: true } : item
		);
		setMessages(next);
		saveMessages(next);
		if (session?.token && backendUrl && !String(message.id).startsWith("demo-")) {
			try {
				await axios.patch(
					`${backendUrl}/api/messages/${message.id}/read`,
					{},
					{ headers: { token: session.token } }
				);
			} catch {
				// local read state still persists
			}
		}
	};

	const sendMessage = async (event) => {
		event.preventDefault();
		if (!messageForm.subject.trim() || !messageForm.body.trim()) return;
		const local = {
			id: `local-${Date.now()}`,
			toRole: "admin",
			subject: messageForm.subject.trim(),
			body: messageForm.body.trim(),
			senderName: employee?.name || "Employee",
			senderRole: "employee",
			read: false,
			date: Date.now(),
		};
		if (session?.token && backendUrl) {
			try {
				const response = await axios.post(
					`${backendUrl}/api/messages`,
					{ ...messageForm, toRole: "admin" },
					{ headers: { token: session.token } }
				);
				if (response.data?.success && response.data.message) {
					local.id = response.data.message._id || response.data.message.id || local.id;
				}
			} catch {
				// saved locally
			}
		}
		const next = [local, ...messages];
		setMessages(next);
		saveMessages(next);
		setMessageForm({ subject: "", body: "" });
		toast.success("Message sent to the admin team.");
	};

	const submitRequest = async (event) => {
		event.preventDefault();
		const type = showRequestForm;
		const payload = {
			type,
			date: requestForm.date,
			endDate: requestForm.endDate,
			reason: requestForm.reason,
		};
		if (!payload.date) {
			toast.error("Please choose a date.");
			return;
		}
		const local = {
			_id: `local-req-${Date.now()}`,
			type,
			employeeId: employee?.id || employee?.email || "me",
			employeeName: employee?.name || "Employee",
			...payload,
			status: "Pending",
			dateSubmitted: Date.now(),
		};
		if (session?.token && backendUrl) {
			try {
				const response = await axios.post(`${backendUrl}/api/employee/requests`, payload, {
					headers: { token: session.token },
				});
				if (response.data?.success && response.data.request) {
					local._id = response.data.request._id || local._id;
				}
			} catch {
				// saved locally
			}
		}
		setRequests((current) => [local, ...current]);
		saveScheduleRequests([local, ...requests]);
		setRequestForm({ date: "", endDate: "", reason: "" });
		setShowRequestForm(null);
		toast.success("Request submitted.");
	};

	const toggleAvailability = async () => {
		const next = !available;
		setAvailable(next);
		try {
			localStorage.setItem(AVAILABILITY_KEY, JSON.stringify(next));
		} catch {
			// ignore
		}
		if (session?.token && backendUrl) {
			try {
				await axios.patch(
					`${backendUrl}/api/employee/me`,
					{ available: next },
					{ headers: { token: session.token } }
				);
				setEmployee((current) => ({ ...(current || {}), available: next }));
			} catch {
				// local toggle still persists
			}
		}
	};

	if (!session) {
		return (
			<div
				data-testid="employee-portal"
				className="mx-auto my-16 max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900"
			>
				<h1 className="text-2xl font-medium prata-regular">Employee Portal</h1>
				<p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
					Sign in with a demo employee account to view your own details and
					upcoming shifts.
				</p>
				<Link
					to="/employee-login"
					className="mt-6 inline-block rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
				>
					Try demo employee
				</Link>
			</div>
		);
	}

	if (loading) {
		return (
			<div
				data-testid="employee-portal"
				className="flex min-h-[50vh] items-center justify-center"
			>
				<div className="h-9 w-9 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800 dark:border-gray-700 dark:border-t-gray-200" />
			</div>
		);
	}

	const inbox = messages.filter((message) => message.toRole === "employee");
	const selectedMessage = inbox.find((item) => item.id === selectedMessageId) || null;
	const pendingOrders = orders.filter((order) => isPending(order.status));

	return (
		<div data-testid="employee-portal" className="mx-auto max-w-6xl my-12 px-4">
			<div className="mb-6 flex flex-wrap items-start justify-between gap-4">
				<div>
					<p className="text-xs font-medium tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400">
						Self-service
					</p>
					<h1 className="mt-1 text-3xl font-medium prata-regular">Employee Portal</h1>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
						Welcome back, {employee?.name || "team member"}.
					</p>
				</div>
				<button
					type="button"
					data-testid="employee-signout"
					onClick={signOut}
					className="rounded-full border border-gray-300 px-5 py-2 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
				>
					Sign out
				</button>
			</div>

			<nav data-testid="employee-nav" className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-3 dark:border-gray-800">
				{TABS.map((item) => (
					<Link
						key={item.key}
						to={`/employee?tab=${item.key}`}
						data-testid={`employee-nav-${item.key}`}
						className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
							tab === item.key
								? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
								: "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
						}`}
					>
						{item.label}
					</Link>
				))}
			</nav>

			{offline && (
				<p
					data-testid="employee-offline-note"
					className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
				>
					Demo mode: the API is unavailable, so changes are stored on this device.
				</p>
			)}

			{tab === "overview" && (
				<div className="grid gap-6 md:grid-cols-2">
					<section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
						<div className="flex items-center justify-between gap-3">
							<h2 className="text-lg font-medium">My details</h2>
							{!editing && (
								<button
									type="button"
									data-testid="edit-profile"
									onClick={startEditing}
									className="text-sm font-medium underline hover:text-black dark:hover:text-white"
								>
									Edit details
								</button>
							)}
						</div>

						{editing ? (
							<form onSubmit={handleSubmit} className="mt-4 space-y-4">
								{[
									{ name: "name", label: "Full name", testId: "edit-name" },
									{ name: "address", label: "Address", testId: "edit-address" },
									{ name: "phone", label: "Phone", testId: "edit-phone" },
									{ name: "email", label: "Email", testId: "edit-email", type: "email" },
								].map((field) => (
									<label key={field.name} className="block">
										<span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
											{field.label}
										</span>
										<input
											data-testid={field.testId}
											name={field.name}
											type={field.type || "text"}
											value={form[field.name]}
											onChange={handleChange}
											required={field.name === "name"}
											className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-gray-300"
										/>
									</label>
								))}
								<div className="flex gap-3 pt-1">
									<button
										type="submit"
										data-testid="save-profile"
										className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
									>
										Save changes
									</button>
									<button
										type="button"
										onClick={() => setEditing(false)}
										className="rounded-full border border-gray-300 px-5 py-2 text-sm dark:border-gray-700"
									>
										Cancel
									</button>
								</div>
							</form>
						) : (
							<dl className="mt-2">
								<Field label="Name" value={employee?.name} testId="employee-name" />
								<Field label="Role / Position" value={employee?.role || employee?.position} testId="employee-role" />
								<Field label="Email" value={employee?.email} testId="employee-email" />
								<Field label="Phone" value={employee?.phone} testId="employee-phone" />
								<Field label="Address" value={employee?.address} testId="employee-address" />
							</dl>
						)}
					</section>

					<section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
						<h2 className="text-lg font-medium">My upcoming schedule</h2>
						<div data-testid="employee-schedule" className="mt-4 space-y-3">
							{schedule.length === 0 ? (
								<p className="text-sm text-gray-600 dark:text-gray-300">No upcoming shifts scheduled.</p>
							) : (
								schedule.map((shift, index) => (
									<div key={`${shift.date}-${shift.startTime}-${index}`} className="rounded-lg bg-gray-50 px-4 py-3 text-sm dark:bg-gray-800/60">
										<p className="font-medium text-gray-900 dark:text-gray-100">{formatShiftDate(shift.date)}</p>
										<p className="mt-0.5 text-gray-600 dark:text-gray-300">
											{shift.startTime} – {shift.endTime} · {shift.location}
										</p>
									</div>
								))
							)}
						</div>
					</section>

					<section data-testid="pending-orders-widget" className="rounded-xl border border-gray-200 bg-white p-6 md:col-span-2 dark:border-gray-800 dark:bg-gray-900">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-medium">Pending orders</h2>
							<Link to="/employee?tab=orders" className="text-sm font-medium underline">View all →</Link>
						</div>
						{pendingOrders.length === 0 ? (
							<p className="mt-3 text-sm text-gray-500">No orders waiting for fulfilment.</p>
						) : (
							<div className="mt-4 grid gap-3 sm:grid-cols-2">
								{pendingOrders.slice(0, 5).map((order) => (
									<div key={order._id} className="rounded-lg bg-gray-50 px-4 py-3 text-sm dark:bg-gray-800/60">
										<p className="font-medium text-gray-900 dark:text-gray-100">
											{order.address?.firstName} {order.address?.lastName}
										</p>
										<p className="text-gray-600 dark:text-gray-300">
											{order.items?.length || 0} items · ${order.amount} · {stageLabel(order.status)}
										</p>
									</div>
								))}
							</div>
						)}
					</section>
				</div>
			)}

			{tab === "orders" && (
				<section data-testid="employee-orders" className="space-y-4">
					<div>
						<h2 className="text-xl font-medium">Orders</h2>
						<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
							Advance orders through Pending → Preparing → Shipped → Delivered.
						</p>
					</div>
					{orders.map((order) => (
						<div key={order._id} data-testid="employee-order-row" className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
							<div className="flex flex-wrap items-start justify-between gap-4">
								<div>
									<p className="font-medium text-gray-900 dark:text-gray-100">
										{order.address?.firstName} {order.address?.lastName}
									</p>
									<p className="text-sm text-gray-600 dark:text-gray-300">
										{order.items?.map((item) => `${item.name} × ${item.quantity}`).join(", ")}
									</p>
									<p className="mt-1 text-xs text-gray-500">
										${order.amount} · {formatDate(order.date)} · {order.paymentMethod || "Card"}
									</p>
								</div>
								<label className="text-xs text-gray-600 dark:text-gray-300">
									Status
									<select
										data-testid="employee-order-status"
										value={
											ORDER_STAGES.find(
												(stage) => stage.value === order.status
											)?.value ||
											(order.status === "Ordered" ? "Order Placed" : order.status === "Out For Delivery" ? "Shipped" : "Order Placed")
										}
										onChange={(event) => updateOrderStatus(order._id, event.target.value)}
										className="mt-1 block rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
									>
										{ORDER_STAGES.map((stage) => (
											<option key={stage.value} value={stage.value}>{stage.label}</option>
										))}
									</select>
								</label>
							</div>
						</div>
					))}
					{orders.length === 0 && <p className="text-sm text-gray-500">No orders yet.</p>}
				</section>
			)}

			{tab === "messages" && (
				<section data-testid="employee-messages">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-xl font-medium">Messages</h2>
						<p className="text-xs text-gray-500">{inbox.filter((item) => !item.read).length} unread</p>
					</div>
					<div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
						<div data-testid="messages-inbox" className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
							{inbox.map((message) => (
								<button
									type="button"
									key={message.id}
									data-testid="message-row"
									onClick={() => openMessage(message)}
									className={`w-full border-b border-gray-100 px-4 py-3 text-left last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60 ${
										selectedMessageId === message.id ? "bg-pink-50/60 dark:bg-pink-500/10" : ""
									}`}
								>
									<div className="flex items-center justify-between gap-3">
										<p data-testid="message-subject" className="text-sm font-medium text-gray-900 dark:text-gray-100">
											{message.subject}
											{!message.read && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-pink-500 align-middle" />}
										</p>
										<span className="text-[11px] text-gray-400">{formatDate(message.date)}</span>
									</div>
									<p className="mt-1 text-xs text-gray-500">{message.senderName} · {message.read ? "Read" : "Unread"}</p>
								</button>
							))}
							{inbox.length === 0 && <p className="p-6 text-sm text-gray-500">Your inbox is empty.</p>}
						</div>
						<div className="space-y-4">
							<div data-testid="message-detail" className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
								{selectedMessage ? (
									<>
										<p className="text-xs uppercase tracking-wide text-gray-400">{selectedMessage.senderName}</p>
										<h3 className="mt-1 text-lg font-medium text-gray-900 dark:text-gray-100">{selectedMessage.subject}</h3>
										<p className="mt-1 text-xs text-gray-400">{formatDate(selectedMessage.date)}</p>
										<p className="mt-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{selectedMessage.body}</p>
									</>
								) : (
									<p className="text-sm text-gray-500">Select a message to read it.</p>
								)}
							</div>
							<form onSubmit={sendMessage} className="grid gap-3 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
								<h3 className="text-sm font-medium">Message the admin team</h3>
								<input
									aria-label="Subject"
									placeholder="Subject"
									value={messageForm.subject}
									maxLength={200}
									onChange={(event) => setMessageForm({ ...messageForm, subject: event.target.value })}
									className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
									required
								/>
								<textarea
									aria-label="Message body"
									placeholder="Write your message…"
									value={messageForm.body}
									maxLength={4000}
									rows={3}
									onChange={(event) => setMessageForm({ ...messageForm, body: event.target.value })}
									className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
									required
								/>
								<button type="submit" className="justify-self-start rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white dark:bg-white dark:text-gray-900">
									Send
								</button>
							</form>
						</div>
					</div>
				</section>
			)}

			{tab === "schedule" && (
				<section data-testid="employee-schedule-page" className="space-y-6">
					<div>
						<h2 className="text-xl font-medium">Schedule</h2>
						<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Shifts, requests and your availability.</p>
					</div>

					<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
						<h3 className="text-lg font-medium">Upcoming shifts</h3>
						<div data-testid="employee-schedule" className="mt-4 space-y-3">
							{schedule.length === 0 ? (
								<p className="text-sm text-gray-500">No upcoming shifts scheduled.</p>
							) : (
								schedule.map((shift, index) => (
									<div key={`${shift.date}-${shift.startTime}-${index}`} className="rounded-lg bg-gray-50 px-4 py-3 text-sm dark:bg-gray-800/60">
										<p className="font-medium text-gray-900 dark:text-gray-100">{formatShiftDate(shift.date)}</p>
										<p className="mt-0.5 text-gray-600 dark:text-gray-300">{shift.startTime} – {shift.endTime} · {shift.location}</p>
									</div>
								))
							)}
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-medium">Availability</h3>
								<button
									type="button"
									data-testid="availability-toggle"
									onClick={toggleAvailability}
									className={`rounded-full px-4 py-2 text-sm font-medium ${
										available
											? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
											: "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
									}`}
								>
									{available ? "Available for shifts" : "Unavailable"}
								</button>
							</div>
							<p className="mt-2 text-xs text-gray-500">Admins can see your current status.</p>
						</div>

						<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
							<h3 className="text-lg font-medium">Submit a request</h3>
							<div className="mt-3 flex gap-2">
								<button type="button" onClick={() => setShowRequestForm("shift")} className="rounded-full border border-gray-300 px-4 py-2 text-sm dark:border-gray-700">Shift swap</button>
								<button type="button" onClick={() => setShowRequestForm("timeoff")} className="rounded-full border border-gray-300 px-4 py-2 text-sm dark:border-gray-700">Time off</button>
							</div>
							{showRequestForm && (
								<form onSubmit={submitRequest} className="mt-4 grid gap-3">
									<input
										aria-label="Request date"
										type="date"
										value={requestForm.date}
										onChange={(event) => setRequestForm({ ...requestForm, date: event.target.value })}
										className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
										required
									/>
									{showRequestForm === "timeoff" && (
										<input
											aria-label="End date"
											type="date"
											value={requestForm.endDate}
											onChange={(event) => setRequestForm({ ...requestForm, endDate: event.target.value })}
											className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
										/>
									)}
									<textarea
										aria-label="Reason"
										placeholder="Reason"
										value={requestForm.reason}
										maxLength={500}
										onChange={(event) => setRequestForm({ ...requestForm, reason: event.target.value })}
										className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
										rows={2}
									/>
									<div className="flex gap-2">
										<button type="submit" data-testid="submit-request" className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white dark:bg-white dark:text-gray-900">Submit request</button>
										<button type="button" onClick={() => setShowRequestForm(null)} className="rounded-full border border-gray-300 px-5 py-2 text-sm dark:border-gray-700">Cancel</button>
									</div>
								</form>
							)}
						</div>
					</div>

					<div data-testid="employee-requests" className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
						<h3 className="text-lg font-medium">My requests</h3>
						<div className="mt-4 space-y-3">
							{requests.map((request) => (
								<div key={String(request._id || request.id)} data-testid="request-row" className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 px-4 py-3 text-sm dark:bg-gray-800/60">
									<div>
										<p className="font-medium text-gray-900 dark:text-gray-100">
											{request.type === "timeoff" ? "Time off" : "Shift swap"} · {formatDate(request.date)}
										</p>
										<p className="text-gray-600 dark:text-gray-300">{request.reason || "No reason provided"}</p>
									</div>
									<span data-testid="request-status" className="rounded-full bg-white px-3 py-1 text-xs font-medium dark:bg-gray-900">{request.status}</span>
								</div>
							))}
							{requests.length === 0 && <p className="text-sm text-gray-500">No requests submitted yet.</p>}
						</div>
					</div>
				</section>
			)}
		</div>
	);
};

export default EmployeePortal;
