import reviewModel from "../models/reviewModel.js";
import userModel from "../models/userModel.js";

// GET /api/review/:productId -> reviews + aggregate rating (public)
const getProductReviews = async (request, response) => {
	try {
		const { productId } = request.params;
		const reviews = await reviewModel
			.find({ productId })
			.sort({ date: -1 });

		const count = reviews.length;
		const average =
			count === 0
				? 0
				: Math.round(
						(reviews.reduce((sum, r) => sum + r.rating, 0) / count) *
							10
				  ) / 10;

		// Breakdown used by the rating bars in the UI.
		const breakdown = [5, 4, 3, 2, 1].map((star) => ({
			star,
			count: reviews.filter((r) => r.rating === star).length,
		}));

		response.json({
			success: true,
			reviews,
			average,
			count,
			breakdown,
		});
	} catch (error) {
		console.log(error);
		response.json({ success: false, message: error.message });
	}
};

// POST /api/review -> create or update the logged-in user's review
const addReview = async (request, response) => {
	try {
		const { userId, productId, rating, title, comment } = request.body;

		const stars = Number(rating);
		if (!productId || !comment?.trim()) {
			return response.json({
				success: false,
				message: "Please add a rating and a comment",
			});
		}
		if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
			return response.json({
				success: false,
				message: "Rating must be between 1 and 5",
			});
		}

		const user = await userModel.findById(userId);
		if (!user) {
			return response.json({
				success: false,
				message: "User not found. Please log in again.",
			});
		}

		const review = await reviewModel.findOneAndUpdate(
			{ productId, userId },
			{
				productId,
				userId,
				name: user.name,
				rating: stars,
				title: title?.trim() || "",
				comment: comment.trim(),
				date: Date.now(),
			},
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);

		response.json({
			success: true,
			message: "Thanks for your review!",
			review,
		});
	} catch (error) {
		console.log(error);
		response.json({ success: false, message: error.message });
	}
};

export { getProductReviews, addReview };
