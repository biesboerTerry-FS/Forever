import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
	employeeId: { type: String, required: true },
	employeeName: { type: String, default: "" },
	date: { type: String, required: true }, // YYYY-MM-DD
	startTime: { type: String, required: true },
	endTime: { type: String, required: true },
	role: { type: String, default: "" },
	location: { type: String, default: "Store" },
	notes: { type: String, default: "" },
	status: { type: String, default: "Scheduled" },
});

const scheduleModel =
	mongoose.models.schedule || mongoose.model("schedule", scheduleSchema);

export default scheduleModel;
