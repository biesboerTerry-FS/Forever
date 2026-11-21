import mongoose from "mongoose";

// A specific date + time range an employee has marked as unavailable. Unlike
// the whole-profile `available` flag, these blocks are scoped to a day/part of
// a day and may carry an optional reason. They are visible to owner/admin in
// Schedule and HR Time-off views.
const availabilityBlockSchema = new mongoose.Schema({
	employeeId: { type: String, required: true, index: true },
	employeeName: { type: String, default: "" },
	date: { type: String, required: true }, // YYYY-MM-DD
	startTime: { type: String, required: true }, // HH:mm
	endTime: { type: String, required: true }, // HH:mm
	reason: { type: String, default: "" },
	seedKey: { type: String, default: "", index: true },
	createdAt: { type: Number, default: Date.now },
});

const availabilityBlockModel =
	mongoose.models.availabilityblock ||
	mongoose.model("availabilityblock", availabilityBlockSchema);

export default availabilityBlockModel;
