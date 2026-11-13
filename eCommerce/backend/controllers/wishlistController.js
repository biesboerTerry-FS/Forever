import userModel from "../models/userModel.js";

// POST /api/wishlist/toggle  { productId }
const toggleWishlist = async (request, response) => {
	try {
		const { userId, productId } = request.body;
		if (!productId) {
			return response.json({
				success: false,
				message: "Product id is required",
			});
		}

		const user = await userModel.findById(userId);
		if (!user) {
			return response.json({
				success: false,
				message: "User not found. Please log in again.",
			});
		}

		const wishlist = (user.wishlist || []).map(String);
		const exists = wishlist.includes(String(productId));
		const updated = exists
			? wishlist.filter((id) => id !== String(productId))
			: [...wishlist, String(productId)];

		await userModel.findByIdAndUpdate(userId, { wishlist: updated });

		response.json({
			success: true,
			added: !exists,
			message: exists ? "Removed from wishlist" : "Saved to wishlist",
			wishlist: updated,
		});
	} catch (error) {
		console.log(error);
		response.json({ success: false, message: error.message });
	}
};

// POST /api/wishlist/get
const getWishlist = async (request, response) => {
	try {
		const { userId } = request.body;
		const user = await userModel.findById(userId);
		response.json({
			success: true,
			wishlist: (user?.wishlist || []).map(String),
		});
	} catch (error) {
		console.log(error);
		response.json({ success: false, message: error.message });
	}
};

export { toggleWishlist, getWishlist };
