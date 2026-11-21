import mongoose from "mongoose";

// Saved shipping addresses for a shopper. Ownership is always derived from the
// verified JWT (request.auth.userId), never from a client-supplied id.
const addressSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			required: true,
			index: true,
		},
		label: { type: String, default: "" },
		firstName: { type: String, default: "" },
		lastName: { type: String, default: "" },
		email: { type: String, default: "" },
		phone: { type: String, default: "" },
		line1: { type: String, required: true },
		line2: { type: String, default: "" },
		city: { type: String, required: true },
		state: { type: String, default: "" },
		zip: { type: String, required: true },
		country: { type: String, required: true },
		isDefault: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

addressSchema.index({ userId: 1, isDefault: 1 });

const addressModel = mongoose.models.address || mongoose.model("address", addressSchema);

export default addressModel;
