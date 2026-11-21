import mongoose from "mongoose";

// Shift-swap / time-off requests and their review state. Availability is kept
// on the employee record itself so the portal can toggle it in one call.
const workRequestSchema = new mongoose.Schema({
	type: { type: String, required: true, enum: ["shift", "timeoff"], index: true },
	employeeId: { type: String, required: true, index: true },
	employeeName: { type: String, default: "" },
	date: { type: String, required: true },
	endDate: { type: String, default: "" },
	reason: { type: String, default: "" },
	status: { type: String, default: "Pending", enum: ["Pending", "Approved", "Declined"] },
	dateSubmitted: { type: Number, default: Date.now },
	demo: { type: Boolean, default: false },
});

const workRequestModel =
	mongoose.models.workrequest ||
	mongoose.model("workrequest", workRequestSchema);

export default workRequestModel;
