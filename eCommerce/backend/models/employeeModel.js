import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	role: { type: String, required: true, default: "Staff" },
	department: { type: String, default: "Retail" },
	status: { type: String, default: "Active" },
	available: { type: Boolean, default: true },
	phone: { type: String, default: "" },
	address: { type: String, default: "" },
	hireDate: { type: Number, default: () => Date.now() },
	hourlyRate: { type: Number, default: 0 },
	managerId: { type: String, default: null },
	notes: { type: String, default: "" },
});

const employeeModel =
	mongoose.models.employee || mongoose.model("employee", employeeSchema);

export default employeeModel;
