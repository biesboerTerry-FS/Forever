import mongoose from "mongoose";

// Demo-only payment method labels. Only masked metadata is ever stored:
// brand, last four digits and an optional expiry label. There is no card
// number, CVC, Stripe customer id or Stripe API call anywhere in this flow.
const paymentMethodSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			required: true,
			index: true,
		},
		label: { type: String, default: "Demo card" },
		brand: { type: String, required: true },
		last4: { type: String, required: true, minlength: 4, maxlength: 4 },
		exp: { type: String, default: "" },
		isDefault: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

paymentMethodSchema.index({ userId: 1, isDefault: 1 });

const paymentMethodModel =
	mongoose.models.paymentmethod || mongoose.model("paymentmethod", paymentMethodSchema);

export default paymentMethodModel;
