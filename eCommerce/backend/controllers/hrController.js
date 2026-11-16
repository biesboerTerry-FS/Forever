import employeeModel from "../models/employeeModel.js";
import scheduleModel from "../models/scheduleModel.js";
import learningModel from "../models/learningModel.js";
import payrollModel from "../models/payrollModel.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";

const calcPayroll = (data) => {
	const hours = Number(data.hours || 0);
	const rate = Number(data.hourlyRate || 0);
	const bonus = Number(data.bonus || 0);
	const deductions = Number(data.deductions || 0);
	const gross = hours * rate + bonus;
	const net = gross - deductions;
	return { grossPay: gross, netPay: net };
};

// Employees
export const listEmployees = async (req, res) => {
	try {
		const { role } = req.query || {};
		const filter = {};
		if (role) filter.role = role;
		const employees = await employeeModel.find(filter).sort({ name: 1 });
		res.json({ success: true, employees });
	} catch (error) {
		res.json({ success: false, message: error.message });
	}
};

export const upsertEmployee = async (req, res) => {
	try {
		const { id, ...data } = req.body || {};
		if (!data.name || !data.email) {
			return res.json({ success: false, message: "Name and email are required." });
		}
		let employee;
		if (id) {
			employee = await employeeModel.findByIdAndUpdate(id, data, { new: true });
			if (!employee) return res.json({ success: false, message: "Employee not found." });
		} else {
			employee = await employeeModel.create(data);
		}
		res.json({ success: true, employee, message: id ? "Employee updated." : "Employee added." });
	} catch (error) {
		res.json({ success: false, message: error.message });
	}
};

export const removeEmployee = async (req, res) => {
	try {
		const { id } = req.body || {};
		await employeeModel.findByIdAndDelete(id);
		res.json({ success: true, message: "Employee removed." });
	} catch (error) {
		res.json({ success: false, message: error.message });
	}
};

// Schedules
export const listSchedules = async (req, res) => {
	try {
		const schedules = await scheduleModel.find({}).sort({ date: 1, startTime: 1 });
		res.json({ success: true, schedules });
	} catch (error) {
		res.json({ success: false, message: error.message });
	}
};

export const upsertSchedule = async (req, res) => {
	try {
		const { id, ...data } = req.body || {};
		if (!data.employeeId || !data.date || !data.startTime || !data.endTime) {
			return res.json({ success: false, message: "Employee, date, start and end time are required." });
		}
		let schedule;
		if (id) {
			schedule = await scheduleModel.findByIdAndUpdate(id, data, { new: true });
			if (!schedule) return res.json({ success: false, message: "Schedule not found." });
		} else {
			schedule = await scheduleModel.create(data);
		}
		res.json({ success: true, schedule, message: id ? "Schedule updated." : "Schedule added." });
	} catch (error) {
		res.json({ success: false, message: error.message });
	}
};

export const removeSchedule = async (req, res) => {
	try {
		const { id } = req.body || {};
		await scheduleModel.findByIdAndDelete(id);
		res.json({ success: true, message: "Schedule removed." });
	} catch (error) {
		res.json({ success: false, message: error.message });
	}
};

// Learning (demo)
export const listLearning = async (req, res) => {
	try {
		const items = await learningModel.find({}).sort({ dueDate: 1, createdAt: -1 });
		res.json({ success: true, learning: items });
	} catch (error) {
		res.json({ success: false, message: error.message });
	}
};

export const upsertLearning = async (req, res) => {
	try {
		const { id, ...data } = req.body || {};
		if (!data.employeeId || !data.course) {
			return res.json({ success: false, message: "Employee and course are required." });
		}
		if (data.status === "Completed" && !data.completedDate) {
			data.completedDate = new Date().toISOString().slice(0, 10);
			if (data.progress == null || Number(data.progress) < 100) data.progress = 100;
		}
		let item;
		if (id) {
			item = await learningModel.findByIdAndUpdate(id, data, { new: true });
			if (!item) return res.json({ success: false, message: "Learning record not found." });
		} else {
			item = await learningModel.create(data);
		}
		res.json({ success: true, item, message: id ? "Learning record updated." : "Learning record added." });
	} catch (error) {
		res.json({ success: false, message: error.message });
	}
};

export const removeLearning = async (req, res) => {
	try {
		const { id } = req.body || {};
		await learningModel.findByIdAndDelete(id);
		res.json({ success: true, message: "Learning record removed." });
	} catch (error) {
		res.json({ success: false, message: error.message });
	}
};

// Payroll
export const listPayroll = async (req, res) => {
	try {
		const payroll = await payrollModel.find({}).sort({ periodEnd: -1, createdAt: -1 });
		res.json({ success: true, payroll });
	} catch (error) {
		res.json({ success: false, message: error.message });
	}
};

export const upsertPayroll = async (req, res) => {
	try {
		const { id, ...data } = req.body || {};
		if (!data.employeeId || !data.periodStart || !data.periodEnd) {
			return res.json({ success: false, message: "Employee and pay period are required." });
		}
		const computed = calcPayroll(data);
		const payload = { ...data, ...computed };
		let item;
		if (id) {
			item = await payrollModel.findByIdAndUpdate(id, payload, { new: true });
			if (!item) return res.json({ success: false, message: "Payroll record not found." });
		} else {
			item = await payrollModel.create(payload);
		}
		res.json({ success: true, item, message: id ? "Payroll updated." : "Payroll record added." });
	} catch (error) {
		res.json({ success: false, message: error.message });
	}
};

export const removePayroll = async (req, res) => {
	try {
		const { id } = req.body || {};
		await payrollModel.findByIdAndDelete(id);
		res.json({ success: true, message: "Payroll record removed." });
	} catch (error) {
		res.json({ success: false, message: error.message });
	}
};

// Reports
export const getReports = async (req, res) => {
	try {
		const [orders, products, employees, schedules, learning, payroll] = await Promise.all([
			orderModel.find({}).lean(),
			productModel.find({}).lean(),
			employeeModel.find({}).lean(),
			scheduleModel.find({}).lean(),
			learningModel.find({}).lean(),
			payrollModel.find({}).lean(),
		]);

		const revenue = orders.reduce((s, o) => s + (Number(o.amount) || 0), 0);
		const paidRevenue = orders.filter((o) => o.payment).reduce((s, o) => s + (Number(o.amount) || 0), 0);
		const ordersByStatus = orders.reduce((acc, o) => {
			const k = o.status || "Unknown";
			acc[k] = (acc[k] || 0) + 1;
			return acc;
		}, {});
		const categoryCounts = products.reduce((acc, p) => {
			const k = p.category || "Uncategorized";
			acc[k] = (acc[k] || 0) + 1;
			return acc;
		}, {});
		const payrollTotals = payroll.reduce(
			(acc, p) => {
				acc.gross += Number(p.grossPay) || 0;
				acc.net += Number(p.netPay) || 0;
				acc.hours += Number(p.hours) || 0;
				return acc;
			},
			{ gross: 0, net: 0, hours: 0 }
		);
		const learningStats = {
			total: learning.length,
			completed: learning.filter((l) => l.status === "Completed").length,
			inProgress: learning.filter((l) => l.status === "In Progress").length,
			assigned: learning.filter((l) => l.status === "Assigned").length,
		};

		res.json({
			success: true,
			reports: {
				summary: {
					revenue,
					paidRevenue,
					orders: orders.length,
					products: products.length,
					employees: employees.length,
					managers: employees.filter((e) => /manager/i.test(String(e.role || ""))).length,
					scheduledShifts: schedules.length,
				},
				ordersByStatus,
				categoryCounts,
				payrollTotals,
				learningStats,
				recentOrders: orders
					.sort((a, b) => (b.date || 0) - (a.date || 0))
					.slice(0, 10)
					.map((o) => ({
						_id: o._id,
						date: o.date,
						amount: o.amount,
						status: o.status,
						payment: o.payment,
						customer: `${o.address?.firstName || ""} ${o.address?.lastName || ""}`.trim(),
					})),
			},
		});
	} catch (error) {
		res.json({ success: false, message: error.message });
	}
};
