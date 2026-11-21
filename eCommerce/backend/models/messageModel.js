import mongoose from "mongoose";

// Role-scoped inbox messages for the admin panel and the employee portal.
const messageSchema = new mongoose.Schema({
	toRole: { type: String, required: true, enum: ["admin", "employee"], index: true },
	subject: { type: String, required: true },
	body: { type: String, required: true, default: "" },
	senderName: { type: String, default: "Forever Team" },
	senderRole: { type: String, default: "system" },
	read: { type: Boolean, default: false },
	date: { type: Number, default: Date.now },
	demo: { type: Boolean, default: false },
});

const messageModel =
	mongoose.models.message || mongoose.model("message", messageSchema);

export default messageModel;
