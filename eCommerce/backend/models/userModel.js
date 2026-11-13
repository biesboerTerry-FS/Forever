import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		cartData: {
			type: Object,
			default: {},
		},
		wishlist: {
			type: Array,
			default: [],
		},
		picture: {
			type: String,
			default: "",
		},
		provider: {
			type: String,
			default: "local",
		},
		resetToken: {
			type: String,
			default: null,
		},
		resetTokenExpiry: {
			type: Date,
			default: null,
		},
		pushTokens: {
			type: [String],
			default: [],
		},
	},
	{ minimize: false }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
