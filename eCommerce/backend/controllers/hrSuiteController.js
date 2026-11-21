// Additional admin-only HR suite endpoints: organization labels, performance
// notes, demo payroll runs and the time-off approval queue.
import employeeModel from "../models/employeeModel.js";
import payrollModel from "../models/payrollModel.js";
import workRequestModel from "../models/workRequestModel.js";
import hrSettingModel from "../models/hrSettingModel.js";
import performanceNoteModel from "../models/performanceNoteModel.js";
import { calcPayroll } from "./hrController.js";
import { ensureHrDemoData } from "../utils/hrDemoData.js";

const cleanList = (value, max = 60) =>
	Array.isArray(value)
		? [...new Set(
				value
					.filter((item) => typeof item === "string")
					.map((item) => item.trim().slice(0, max))
					.filter(Boolean)
			)]
		: [];

const today = () => new Date().toISOString().slice(0, 10);

// ---- Roles & departments ------------------------------------------------
export const getOrganization = async (request, response) => {
	try {
		await ensureHrDemoData();
		let settings = await hrSettingModel.findOne({ key: "org" }).lean();
		if (!settings) {
			await hrSettingModel.create({ key: "org", departments: [], roles: [] });
			settings = { departments: [], roles: [] };
		}
		return response.json({
			success: true,
			departments: settings.departments || [],
			roles: settings.roles || [],
		});
	} catch (error) {
		return response.json({ success: false, message: error.message });
	}
};

export const saveOrganization = async (request, response) => {
	try {
		const departments = cleanList(request.body?.departments);
		const roles = cleanList(request.body?.roles);
		if (!departments.length || !roles.length) {
			return response.status(400).json({
				success: false,
				message: "At least one department and one role are required.",
			});
		}
		const settings = await hrSettingModel.findOneAndUpdate(
			{ key: "org" },
			{ $set: { departments, roles, updatedAt: Date.now() } },
			{ new: true, upsert: true, runValidators: true }
		);
		return response.json({
			success: true,
			departments: settings.departments,
			roles: settings.roles,
			message: "Departments and roles saved.",
		});
	} catch (error) {
		return response.json({ success: false, message: error.message });
	}
};

// ---- Performance notes --------------------------------------------------
export const listPerformanceNotes = async (request, response) => {
	try {
		await ensureHrDemoData();
		const { employeeId } = request.query || {};
		const filter = employeeId ? { employeeId: String(employeeId) } : {};
		const notes = await performanceNoteModel
			.find(filter)
			.sort({ date: -1, createdAt: -1 })
			.lean();
		return response.json({ success: true, notes });
	} catch (error) {
		return response.json({ success: false, message: error.message });
	}
};

export const addPerformanceNote = async (request, response) => {
	try {
		const { employeeId, text, author, date } = request.body || {};
		const employee = await employeeModel.findById(String(employeeId)).lean();
		if (!employee) {
			return response.status(404).json({ success: false, message: "Employee not found." });
		}
		const note = await performanceNoteModel.create({
			employeeId: String(employee._id),
			employeeName: employee.name,
			author: typeof author === "string" && author.trim() ? author.trim().slice(0, 120) : "Admin",
			text: String(text).trim().slice(0, 1000),
			date: typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : today(),
			createdAt: Date.now(),
		});
		return response.json({ success: true, note, message: "Performance note added." });
	} catch (error) {
		return response.json({ success: false, message: error.message });
	}
};

// ---- Demo payroll run ---------------------------------------------------
export const runPayroll = async (request, response) => {
	try {
		await ensureHrDemoData();
		const { employeeId, periodStart, periodEnd } = request.body || {};
		const employee = await employeeModel.findById(String(employeeId)).lean();
		if (!employee) {
			return response.status(404).json({ success: false, message: "Employee not found." });
		}
		const computed = calcPayroll({
			hours: request.body.hours,
			hourlyRate: request.body.hourlyRate ?? employee.hourlyRate,
			bonus: request.body.bonus,
			deductions: request.body.deductions,
		});
		const item = await payrollModel.create({
			employeeId: String(employee._id),
			employeeName: employee.name,
			periodStart: String(periodStart),
			periodEnd: String(periodEnd),
			hours: Number(request.body.hours || 0),
			hourlyRate: Number(request.body.hourlyRate ?? employee.hourlyRate ?? 0),
			bonus: Number(request.body.bonus || 0),
			deductions: Number(request.body.deductions || 0),
			...computed,
			status: "Paid",
			notes: "Demo pay run",
			createdAt: Date.now(),
		});
		return response.json({
			success: true,
			item,
			message: `Payroll run for ${employee.name} marked as paid.`,
		});
	} catch (error) {
		return response.json({ success: false, message: error.message });
	}
};

// ---- Time-off approval queue -------------------------------------------
export const listTimeOff = async (request, response) => {
	try {
		await ensureHrDemoData();
		const { status, type } = request.query || {};
		const filter = {};
		if (status) filter.status = String(status);
		if (type) filter.type = String(type);
		const requests = await workRequestModel.find(filter).sort({ dateSubmitted: -1 }).lean();
		return response.json({ success: true, requests });
	} catch (error) {
		return response.json({ success: false, message: error.message });
	}
};
