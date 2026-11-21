import mongoose from "mongoose";

// Per-employee performance notes authored by admins. Append-only from the UI.
const performanceNoteSchema = new mongoose.Schema({
	employeeId: { type: String, required: true, index: true },
	employeeName: { type: String, default: "" },
	author: { type: String, default: "Admin" },
	text: { type: String, required: true },
	date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
	createdAt: { type: Number, default: () => Date.now() },
	seedKey: { type: String, default: "", index: true },
});

const performanceNoteModel =
	mongoose.models.performancenote ||
	mongoose.model("performancenote", performanceNoteSchema);

export default performanceNoteModel;
