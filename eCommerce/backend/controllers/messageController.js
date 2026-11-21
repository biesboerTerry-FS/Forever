// Role-scoped messaging for the admin panel and employee portal.
import messageModel from "../models/messageModel.js";

const day = 24 * 60 * 60 * 1000;

// Demo inbox content is seeded once so both portals have something to read.
const DEMO_MESSAGES = [
	{
		toRole: "admin",
		subject: "Weekly ops summary is ready",
		body: "This week's sales, payroll and scheduling reports are available in the dashboard. Please review before the Monday team meeting.",
		senderName: "Forever Operations",
		senderRole: "system",
	},
	{
		toRole: "admin",
		subject: "Supplier backorder update",
		body: "Our apparel supplier confirmed the delayed shipment. Expected arrival is next Thursday; inventory will be updated automatically.",
		senderName: "Supply Desk",
		senderRole: "system",
	},
	{
		toRole: "employee",
		subject: "New shifts posted for next week",
		body: "The updated store rota is live. Check the Schedule section to see your upcoming shifts and submit any swap requests.",
		senderName: "Store Manager",
		senderRole: "admin",
	},
	{
		toRole: "employee",
		subject: "Reminder: POS software update",
		body: "Please restart your register before your next shift so the latest point-of-sale update is applied.",
		senderName: "Store Manager",
		senderRole: "admin",
	},
];

let seedPromise = null;
const ensureDemoMessages = () => {
	if (!seedPromise) {
		seedPromise = messageModel
			.countDocuments()
			.then(async (count) => {
				if (count === 0) {
					await messageModel.insertMany(
						DEMO_MESSAGES.map((message, index) => ({
							...message,
							date: Date.now() - index * day,
							demo: true,
						}))
					);
				}
			})
			.catch((error) => {
				seedPromise = null; // allow a later request to retry
				throw error;
			});
	}
	return seedPromise;
};

export const listMessages = async (request, response) => {
	try {
		await ensureDemoMessages();
		const role = request.staff.role === "admin" ? "admin" : "employee";
		const messages = await messageModel.find({ toRole: role }).sort({ date: -1 }).lean();
		return response.json({ success: true, messages });
	} catch (error) {
		console.error("listMessages:", error.message);
		return response.json({ success: false, message: "Could not load messages." });
	}
};

export const createMessage = async (request, response) => {
	try {
		const { subject, body, toRole } = request.body || {};
		const role = request.staff.role === "admin" ? "admin" : "employee";
		if (typeof subject !== "string" || !subject.trim() || subject.length > 200) {
			return response.status(400).json({ success: false, message: "A subject is required." });
		}
		if (typeof body !== "string" || !body.trim() || body.length > 4000) {
			return response.status(400).json({ success: false, message: "A message body is required." });
		}
		const recipient =
			toRole === "employee" || toRole === "admin" ? toRole : role === "admin" ? "employee" : "admin";

		const message = await messageModel.create({
			toRole: recipient,
			subject: subject.trim(),
			body: body.trim(),
			senderName: request.staff.role === "admin" ? "Admin" : "Employee",
			senderRole: role,
			date: Date.now(),
		});
		return response.json({ success: true, message });
	} catch (error) {
		console.error("createMessage:", error.message);
		return response.json({ success: false, message: "Could not send message." });
	}
};

export const markMessageRead = async (request, response) => {
	try {
		const role = request.staff.role === "admin" ? "admin" : "employee";
		const message = await messageModel.findOneAndUpdate(
			{ _id: request.params.id, toRole: role },
			{ read: true },
			{ new: true }
		);
		if (!message) {
			return response.status(404).json({ success: false, message: "Message not found." });
		}
		return response.json({ success: true, message });
	} catch {
		return response.status(400).json({ success: false, message: "Invalid message id." });
	}
};
