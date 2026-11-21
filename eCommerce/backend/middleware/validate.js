// Lightweight validation for state-changing endpoints. Rejects missing,
// wrong-typed and oversized values before they reach controllers/MongoDB.
// Plain 400 JSON responses keep existing client error handling intact.
import validator from "validator";

const fail = (response, message) =>
	response.status(400).json({ success: false, message });

const isObject = (value) =>
	value !== null && typeof value === "object" && !Array.isArray(value);

const missing = (value) =>
	value === undefined ||
	value === null ||
	(typeof value === "string" && value.trim().length === 0);

/**
 * Build a validator from a field map. Each rule supports:
 * required, type ('string'|'number'|'array'|'object'), min, max, maxItems,
 * email, message.
 */
export const fields = (rules) => (request, response, next) => {
	if (!isObject(request.body)) return fail(response, "Invalid request body.");

	for (const [name, rule] of Object.entries(rules)) {
		const value = request.body[name];

		if (missing(value)) {
			if (rule.required) {
				return fail(response, rule.message || `${name} is required.`);
			}
			continue;
		}

		if (rule.type === "array") {
			if (!Array.isArray(value)) return fail(response, `${name} must be a list.`);
			if (rule.maxItems && value.length > rule.maxItems) {
				return fail(response, `Too many items in ${name}.`);
			}
			continue;
		}

		if (rule.type === "object") {
			if (!isObject(value)) return fail(response, `${name} must be an object.`);
			continue;
		}

		if (rule.type === "number") {
			const numeric = Number(value);
			if (!Number.isFinite(numeric)) {
				return fail(response, `${name} must be a number.`);
			}
			if (rule.min !== undefined && numeric < rule.min) {
				return fail(response, `${name} is too small.`);
			}
			if (rule.max !== undefined && numeric > rule.max) {
				return fail(response, `${name} is too large.`);
			}
			continue;
		}

		if (typeof value !== "string") {
			return fail(response, `${name} must be text.`);
		}
		if (value.length > (rule.max ?? 200)) {
			return fail(response, `${name} is too long.`);
		}
		if (rule.min && value.trim().length < rule.min) {
			return fail(response, `${name} is too short.`);
		}
		if (rule.email && !validator.isEmail(value.trim())) {
			return fail(response, "Please enter a valid email address.");
		}
		if (rule.pattern && !rule.pattern.test(value)) {
			return fail(response, rule.message || `${name} is invalid.`);
		}
	}

	next();
};

// Generic guard for nested/flexible payloads (HR records, order addresses,
// multipart product forms): cap every string and reject pathological nesting.
export const capBodyStrings = (maxLength = 1000) => (request, response, next) => {
	const check = (value, depth) => {
		if (depth > 6) return false;
		if (typeof value === "string") return value.length <= maxLength;
		if (Array.isArray(value)) {
			return value.length <= 200 && value.every((item) => check(item, depth + 1));
		}
		if (isObject(value)) {
			return Object.keys(value).length <= 100 &&
				Object.values(value).every((item) => check(item, depth + 1));
		}
		return value === null || ["boolean", "number"].includes(typeof value);
	};

	if (!isObject(request.body) || !check(request.body, 0)) {
		return fail(response, "Request body is malformed or too large.");
	}
	next();
};

// Cart/order items are re-priced server-side, but still bound the shape so a
// single request cannot exhaust memory or CPU.
export const validateOrderItems = (request, response, next) => {
	const items = request.body?.items;
	if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
		return fail(response, "Your cart is empty or too large.");
	}
	for (const item of items) {
		if (!isObject(item) || typeof item._id !== "string" || item._id.length > 120) {
			return fail(response, "One of your items is invalid.");
		}
		if (item.quantity !== undefined && Number(item.quantity) > 99) {
			return fail(response, "Item quantity is too large.");
		}
	}
	next();
};

// ---- Auth / user routes -------------------------------------------------
export const validateLogin = fields({
	email: { required: true, max: 254, message: "Email and password are required." },
	password: { required: true, max: 128, min: 1, message: "Email and password are required." },
});
export const validateRegister = fields({
	name: { required: true, max: 80, min: 1 },
	email: { required: true, max: 254, email: true },
	password: { required: true, max: 128, min: 8, message: "Password must contain at least 8 characters" },
});
export const validateAdminLogin = fields({
	email: { required: true, max: 254, message: "Invalid credentials" },
	password: { required: true, max: 128, message: "Invalid credentials" },
});
export const validateClerkLogin = fields({
	clerkToken: { required: true, max: 8192, min: 10, message: "Missing Clerk session token" },
});
export const validateGoogleLogin = fields({
	credential: { required: true, max: 8192, min: 10, message: "Missing Google credential" },
});
export const validateForgotPassword = fields({
	email: { required: true, max: 254, email: true },
});
export const validateResetPassword = fields({
	token: { required: true, max: 256, min: 10, message: "Reset link is invalid or has expired." },
	password: { required: true, max: 128, min: 8, message: "Password must contain at least 8 characters" },
});
export const validatePushToken = fields({
	pushToken: { required: true, max: 256, min: 10, message: "Missing push token" },
});

// ---- Storefront mutations ----------------------------------------------
export const validateNewsletter = fields({
	email: { required: true, max: 254, email: true, message: "Please enter a valid email address." },
});
export const validateCartAdd = fields({
	itemId: { required: true, max: 120 },
	size: { required: true, max: 40 },
});
export const validateCartUpdate = fields({
	itemId: { required: true, max: 120 },
	size: { required: true, max: 40 },
	quantity: { required: true, type: "number", min: 0, max: 99 },
});
export const validateWishlist = fields({
	productId: { required: true, max: 120, message: "Product id is required" },
});
export const validateReview = fields({
	productId: { required: true, max: 120 },
	rating: { required: true, type: "number", min: 1, max: 5, message: "Rating must be between 1 and 5" },
	title: { max: 200 },
	comment: { required: true, max: 2000, min: 1, message: "Please add a rating and a comment" },
});
export const validateOrder = [
	fields({
		items: { required: true, type: "array", maxItems: 100, message: "Your cart is empty." },
		address: { required: true, type: "object", message: "Shipping address is required." },
		paymentMethod: { max: 20 },
	}),
	validateOrderItems,
	capBodyStrings(500),
];
export const validateStripeVerification = fields({
	orderId: { required: true, max: 120, message: "Missing order id" },
	success: { max: 10 },
});
export const validateRazorpayVerification = fields({
	razorpay_order_id: { required: true, max: 200, message: "Missing Razorpay order id" },
});

// ---- Admin / HR mutations ----------------------------------------------
export const requireId = fields({
	id: { required: true, max: 120, message: "An id is required." },
});
export const validateOrderStatus = fields({
	orderId: { required: true, max: 120, message: "Order id is required." },
	status: { required: true, max: 60 },
});
export const validateOrderEdit = [
	fields({ orderId: { required: true, max: 120, message: "Order id is required." } }),
	capBodyStrings(1000),
];
export const validateHrUpsert = (...requiredNames) => [
	fields(
		Object.fromEntries(
			requiredNames.map((name) => [
				name,
				{
					required: true,
					max: 200,
					message: `${name.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())} is required.`,
				},
			])
		)
	),
	capBodyStrings(1000),
];
export const validateHrRemove = [requireId];
export const validateEmployeeProfile = capBodyStrings(200);

// ---- Admin HR suite -----------------------------------------------------
export const validateHrEmployeeUpsert = [
	fields({
		id: { max: 120 },
		name: { required: true, max: 120, min: 1 },
		email: { required: true, max: 200, email: true },
		role: { max: 120 },
		department: { max: 120 },
		status: { max: 60 },
		phone: { max: 60 },
		address: { max: 300 },
		hourlyRate: { type: "number", min: 0, max: 1000 },
	}),
	capBodyStrings(1000),
];
export const validateHrOrganization = [
	fields({
		departments: { required: true, type: "array", maxItems: 100 },
		roles: { required: true, type: "array", maxItems: 100 },
	}),
	capBodyStrings(200),
];
export const validateHrPayrollRun = [
	fields({
		employeeId: { required: true, max: 120 },
		periodStart: {
			required: true,
			max: 10,
			pattern: /^\d{4}-\d{2}-\d{2}$/,
			message: "Use YYYY-MM-DD for the period start.",
		},
		periodEnd: {
			required: true,
			max: 10,
			pattern: /^\d{4}-\d{2}-\d{2}$/,
			message: "Use YYYY-MM-DD for the period end.",
		},
		hours: { type: "number", min: 0, max: 1000 },
		hourlyRate: { type: "number", min: 0, max: 1000 },
		bonus: { type: "number", min: 0, max: 100000 },
		deductions: { type: "number", min: 0, max: 100000 },
	}),
	capBodyStrings(500),
];
export const validateHrPerformanceNote = [
	fields({
		employeeId: { required: true, max: 120 },
		text: { required: true, max: 1000, min: 1, message: "Note text is required." },
		author: { max: 120 },
		date: { max: 10 },
	}),
	capBodyStrings(1000),
];
