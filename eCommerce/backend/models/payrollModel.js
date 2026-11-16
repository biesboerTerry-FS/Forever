import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema({
	employeeId: { type: String, required: true },
	employeeName: { type: String, default: "" },
	periodStart: { type: String, required: true },
	periodEnd: { type: String, required: true },
	hours: { type: Number, default: 0 },
	hourlyRate: { type: Number, default: 0 },
	bonus: { type: Number, default: 0 },
	deductions: { type: Number, default: 0 },
	grossPay: { type: Number, default: 0 },
	netPay: { type: Number, default: 0 },
	status: { type: String, default: "Draft" }, // Draft, Approved, Paid
	notes: { type: String, default: "" },
	createdAt: { type: Number, default: () => Date.now() },
});

const payrollModel =
	mongoose.models.payroll || mongoose.model("payroll", payrollSchema);

export default payrollModel;
