import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
	productId: {
		type: String,
		required: true,
		index: true,
	},
	userId: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	rating: {
		type: Number,
		required: true,
		min: 1,
		max: 5,
	},
	title: {
		type: String,
		default: "",
	},
	comment: {
		type: String,
		required: true,
	},
	date: {
		type: Number,
		default: Date.now,
	},
});

// One review per user per product (posting again updates it).
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const reviewModel =
	mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel;
