// Schedule requests (shift swaps / time off) for employees and admins.
import workRequestModel from "../models/workRequestModel.js";
import employeeModel from "../models/employeeModel.js";

const day = 24 * 60 * 60 * 1000;
const dateKey = (offset) => {
	const date = new Date(Date.now() + offset * day);
	return date.toISOString().slice(0, 10);
};

let seedPromise = null;
const ensureDemoRequests = () => {
	if (!seedPromise) {
		seedPromise = (async () => {
			const people = await employeeModel.find({
				email: { $in: ["sam.staff@forever.test", "taylor.staff@forever.test"] },
			}).lean();
			const owner = people[0]?._id ? String(people[0]._id) : "demo-employee";
			const seeds = [
				{
					seedKey: "portal-sam-swap",
					type: "shift",
					employeeId: owner,
					employeeName: people[0]?.name || "Sam Rivera",
					date: dateKey(3),
					reason: "Swap my Saturday shift with Sunday",
					status: "Pending",
					demo: true,
				},
				{
					seedKey: "portal-sam-timeoff",
					type: "timeoff",
					employeeId: owner,
					employeeName: people[0]?.name || "Sam Rivera",
					date: dateKey(7),
					endDate: dateKey(9),
					reason: "Family event",
					status: "Approved",
					demo: true,
				},
				{
					seedKey: "portal-taylor-shift",
					type: "shift",
					employeeId: people[1]?._id ? String(people[1]._id) : "demo-employee-2",
					employeeName: people[1]?.name || "Taylor Kim",
					date: dateKey(5),
					reason: "Cover the morning opening shift",
					status: "Pending",
					demo: true,
				},
			];
			// Seed each request individually by stable key. The admin HR suite
			// seeds its own requests too, so a simple count check is not enough.
			for (const request of seeds) {
				await workRequestModel.updateOne(
					{ seedKey: request.seedKey },
					{ $setOnInsert: { ...request, dateSubmitted: Date.now() } },
					{ upsert: true }
				);
			}
		})().catch((error) => {
			seedPromise = null;
			throw error;
		});
	}
	return seedPromise;
};

export const listMyRequests = async (request, response) => {
	try {
		await ensureDemoRequests();
		const employeeId = request.employeeAuth.employeeId;
		const [requests, employee] = await Promise.all([
			workRequestModel.find({ employeeId }).sort({ dateSubmitted: -1 }).lean(),
			employeeModel.findById(employeeId).lean(),
		]);
		return response.json({
			success: true,
			requests,
			available: employee?.available !== false,
		});
	} catch (error) {
		console.error("listMyRequests:", error.message);
		return response.json({ success: false, message: "Could not load requests." });
	}
};

export const createRequest = async (request, response) => {
	try {
		const { type, date, endDate, reason } = request.body || {};
		if (type !== "shift" && type !== "timeoff") {
			return response.status(400).json({ success: false, message: "Choose a request type." });
		}
		if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			return response.status(400).json({ success: false, message: "A valid date is required." });
		}
		if (typeof reason === "string" && reason.length > 500) {
			return response.status(400).json({ success: false, message: "Reason is too long." });
		}
		const employeeId = request.employeeAuth.employeeId;
		const employee = await employeeModel.findById(employeeId).lean();
		const created = await workRequestModel.create({
			type,
			employeeId,
			employeeName: employee?.name || "Employee",
			date,
			endDate: typeof endDate === "string" ? endDate.slice(0, 10) : "",
			reason: typeof reason === "string" ? reason.trim() : "",
			status: "Pending",
		});
		return response.json({ success: true, request: created });
	} catch (error) {
		console.error("createRequest:", error.message);
		return response.json({ success: false, message: "Could not submit request." });
	}
};

export const listAllRequests = async (request, response) => {
	try {
		await ensureDemoRequests();
		const requests = await workRequestModel.find({}).sort({ dateSubmitted: -1 }).lean();
		return response.json({ success: true, requests });
	} catch (error) {
		console.error("listAllRequests:", error.message);
		return response.json({ success: false, message: "Could not load requests." });
	}
};

export const updateRequestStatus = async (request, response) => {
	try {
		const { status } = request.body || {};
		if (!["Pending", "Approved", "Declined"].includes(status)) {
			return response.status(400).json({ success: false, message: "Invalid status." });
		}
		const updated = await workRequestModel.findByIdAndUpdate(
			request.params.id,
			{ status },
			{ new: true }
		);
		if (!updated) {
			return response.status(404).json({ success: false, message: "Request not found." });
		}
		return response.json({ success: true, request: updated });
	} catch {
		return response.status(400).json({ success: false, message: "Invalid request id." });
	}
};
