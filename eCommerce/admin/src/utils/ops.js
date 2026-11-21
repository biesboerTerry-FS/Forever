// Shared ops data helpers. The API is the source of truth when available;
// localStorage keeps the demo usable offline/without a seeded database.
const MESSAGES_KEY = "forever-messages";
const REQUESTS_KEY = "forever-schedule-requests";
const ORDER_STATUS_KEY = "forever-order-status-overrides";

const day = 24 * 60 * 60 * 1000;
const dateKey = (offset) =>
	new Date(Date.now() + offset * day).toISOString().slice(0, 10);

export const ORDER_STAGES = [
	{ value: "Order Placed", label: "Pending" },
	{ value: "Packing", label: "Preparing" },
	{ value: "Shipped", label: "Shipped" },
	{ value: "Delivered", label: "Delivered" },
];

export const stageLabel = (status) => {
	const found = ORDER_STAGES.find(
		(stage) => stage.value.toLowerCase() === String(status || "").trim().toLowerCase()
	);
	if (found) return found.label;
	const lower = String(status || "").toLowerCase();
	if (lower === "ordered") return "Pending";
	if (lower === "out for delivery" || lower === "in transit") return "Shipped";
	return status || "Pending";
};

export const isPending = (status) =>
	["pending", "order placed", "ordered", "packing", "preparing"].includes(
		String(status || "").trim().toLowerCase()
	);

const seedMessages = () => [
	{
		id: "demo-msg-1",
		toRole: "admin",
		subject: "Weekly ops summary is ready",
		body: "This week's sales, payroll and scheduling reports are available in the dashboard. Please review before the Monday team meeting.",
		senderName: "Forever Operations",
		senderRole: "system",
		read: false,
		date: Date.now() - 2 * 60 * 60 * 1000,
		demo: true,
	},
	{
		id: "demo-msg-2",
		toRole: "admin",
		subject: "Supplier backorder update",
		body: "Our apparel supplier confirmed the delayed shipment. Expected arrival is next Thursday; inventory will be updated automatically.",
		senderName: "Supply Desk",
		senderRole: "system",
		read: false,
		date: Date.now() - day,
		demo: true,
	},
	{
		id: "demo-msg-3",
		toRole: "employee",
		subject: "New shifts posted for next week",
		body: "The updated store rota is live. Check the Schedule section to see your upcoming shifts and submit any swap requests.",
		senderName: "Store Manager",
		senderRole: "admin",
		read: false,
		date: Date.now() - 3 * day,
		demo: true,
	},
];

const seedRequests = () => [
	{
		_id: "demo-req-1",
		type: "shift",
		employeeId: "sam.staff@forever.test",
		employeeName: "Sam Rivera",
		date: dateKey(3),
		reason: "Swap my Saturday shift with Sunday",
		status: "Pending",
		dateSubmitted: Date.now() - day,
		demo: true,
	},
	{
		_id: "demo-req-2",
		type: "timeoff",
		employeeId: "taylor.staff@forever.test",
		employeeName: "Taylor Kim",
		date: dateKey(7),
		endDate: dateKey(9),
		reason: "Family event",
		status: "Approved",
		dateSubmitted: Date.now() - 2 * day,
		demo: true,
	},
];

const readList = (key, seed) => {
	try {
		const raw = window.localStorage.getItem(key);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) return parsed;
		}
		const seeded = seed();
		window.localStorage.setItem(key, JSON.stringify(seeded));
		return seeded;
	} catch {
		return seed();
	}
};

const writeList = (key, value) => {
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// storage disabled — in-memory state still works
	}
	return value;
};

const withId = (item) => ({
	...item,
	id: item.id || item._id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
	date: item.date || item.dateSubmitted || Date.now(),
});

export const loadMessages = () => readList(MESSAGES_KEY, seedMessages).map(withId);
export const saveMessages = (messages) => writeList(MESSAGES_KEY, messages);
export const loadScheduleRequests = () => readList(REQUESTS_KEY, seedRequests);
export const saveScheduleRequests = (requests) => writeList(REQUESTS_KEY, requests);

export const loadOrderStatusOverrides = () => {
	try {
		return JSON.parse(window.localStorage.getItem(ORDER_STATUS_KEY) || "{}") || {};
	} catch {
		return {};
	}
};

export const saveOrderStatusOverride = (orderId, status) => {
	const overrides = loadOrderStatusOverrides();
	overrides[orderId] = status;
	writeList(ORDER_STATUS_KEY, overrides);
	return overrides;
};

export const applyOrderStatusOverrides = (orders) =>
	Array.isArray(orders)
		? orders.map((order) => {
				const override = loadOrderStatusOverrides()[order._id];
				return override ? { ...order, status: override } : order;
			})
		: [];

export const formatDate = (value) => {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? String(value || "") : date.toLocaleDateString();
};
