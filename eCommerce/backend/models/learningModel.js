import mongoose from "mongoose";

const learningSchema = new mongoose.Schema({
	employeeId: { type: String, required: true },
	employeeName: { type: String, default: "" },
	course: { type: String, required: true },
	module: { type: String, default: "" },
	status: { type: String, default: "Assigned" }, // Assigned, In Progress, Completed
	progress: { type: Number, default: 0 },
	dueDate: { type: String, default: "" },
	completedDate: { type: String, default: "" },
	score: { type: Number, default: null },
	notes: { type: String, default: "" },
});

const learningModel =
	mongoose.models.learning || mongoose.model("learning", learningSchema);

export default learningModel;
