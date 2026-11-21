import mongoose from "mongoose";

// Single-document configuration for the admin HR suite (department list and
// role labels). Kept in the database so admins can edit it from the UI.
const hrSettingSchema = new mongoose.Schema({
	key: { type: String, required: true, unique: true },
	departments: { type: [String], default: [] },
	roles: { type: [String], default: [] },
	updatedAt: { type: Number, default: () => Date.now() },
});

const hrSettingModel =
	mongoose.models.hrsetting || mongoose.model("hrsetting", hrSettingSchema);

export default hrSettingModel;
