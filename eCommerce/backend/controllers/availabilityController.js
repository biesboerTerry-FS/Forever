// Employee availability blocks (specific date + time ranges). Employees manage
// only their own blocks; owner/admin can list every block for scheduling.
import availabilityBlockModel from "../models/availabilityBlockModel.js";
import employeeModel from "../models/employeeModel.js";

const day = 24 * 60 * 60 * 1000;
const dateKey = (offset) => new Date(Date.now() + offset * day).toISOString().slice(0, 10);
const isDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
const isTime = (value) => typeof value === "string" && /^\d{2}:\d{2}$/.test(value);
const minutes = (value) => {
	const [hours, mins] = value.split(":").map(Number);
	return hours * 60 + mins;
};

// Two realistic demo blocks so the feature is visible in the portfolio demo.
let seedPromise = null;
const ensureDemoBlocks = () => {
	if (!seedPromise) {
		seedPromise = (async () => {
			const people = await employeeModel.find({
				email: { $in: ["sam.staff@forever.test", "taylor.staff@forever.test"] },
			}).lean();
			const seeds = [
				{
					seedKey: "portal-block-sam-school",
					employeeId: people[0]?._id ? String(people[0]._id) : "demo-employee",
					employeeName: people[0]?.name || "Sam Rivera",
					date: dateKey(2),
					startTime: "13:00",
					endTime: "17:00",
					reason: "School pickup",
				},
				{
					seedKey: "portal-block-taylor-dentist",
					employeeId: people[1]?._id ? String(people[1]._id) : "demo-employee-2",
					employeeName: people[1]?.name || "Taylor Kim",
					date: dateKey(6),
					startTime: "09:00",
					endTime: "12:00",
					reason: "Dental appointment",
				},
			];
			for (const block of seeds) {
				await availabilityBlockModel.updateOne(
					{ seedKey: block.seedKey },
					{ $setOnInsert: { ...block, createdAt: Date.now() } },
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

const present = (block) => ({
	id: String(block._id),
	_id: String(block._id),
	employeeId: block.employeeId,
	employeeName: block.employeeName || "",
	date: block.date,
	startTime: block.startTime,
	endTime: block.endTime,
	reason: block.reason || "",
});

// GET /api/employee/blocks — only the signed-in employee's blocks.
export const listMyBlocks = async (request, response) => {
	try {
		await ensureDemoBlocks();
		const blocks = await availabilityBlockModel
			.find({ employeeId: request.employeeAuth.employeeId })
			.sort({ date: 1, startTime: 1 })
			.lean();
		return response.json({ success: true, blocks: blocks.map(present) });
	} catch (error) {
		console.error("listMyBlocks:", error.message);
		return response.json({ success: false, message: "Could not load availability blocks." });
	}
};

// POST /api/employee/blocks — create a block for the signed-in employee.
export const createBlock = async (request, response) => {
	try {
		const { date, startTime, endTime, reason } = request.body || {};
		if (!isDate(date)) {
			return response.status(400).json({ success: false, message: "A valid date is required." });
		}
		if (!isTime(startTime) || !isTime(endTime) || minutes(endTime) <= minutes(startTime)) {
			return response.status(400).json({ success: false, message: "A valid time range is required." });
		}
		if (typeof reason === "string" && reason.length > 300) {
			return response.status(400).json({ success: false, message: "Reason is too long." });
		}
		const employeeId = request.employeeAuth.employeeId;
		const employee = await employeeModel.findById(employeeId).lean();
		const block = await availabilityBlockModel.create({
			employeeId,
			employeeName: employee?.name || "Employee",
			date,
			startTime,
			endTime,
			reason: typeof reason === "string" ? reason.trim() : "",
		});
		return response.json({ success: true, block: present(block) });
	} catch (error) {
		console.error("createBlock:", error.message);
		return response.json({ success: false, message: "Could not save availability block." });
	}
};

// DELETE /api/employee/blocks/:id — scoped so an employee can only remove own.
export const deleteBlock = async (request, response) => {
	try {
		const removed = await availabilityBlockModel.findOneAndDelete({
			_id: request.params.id,
			employeeId: request.employeeAuth.employeeId,
		});
		if (!removed) {
			return response.status(404).json({ success: false, message: "Block not found." });
		}
		return response.json({ success: true, message: "Availability block removed." });
	} catch {
		return response.status(400).json({ success: false, message: "Invalid block id." });
	}
};

// GET /api/employee/blocks/all — admin/owner view of every block.
export const listAllBlocks = async (request, response) => {
	try {
		await ensureDemoBlocks();
		const blocks = await availabilityBlockModel.find({}).sort({ date: 1, startTime: 1 }).lean();
		return response.json({ success: true, blocks: blocks.map(present) });
	} catch (error) {
		console.error("listAllBlocks:", error.message);
		return response.json({ success: false, message: "Could not load availability blocks." });
	}
};
