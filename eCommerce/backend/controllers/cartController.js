import userModel from "../models/userModel.js";

// Add products to user caretColor:
const addToCart = async (request, response) => {
	try {
		const { userId, itemId, size } = request.body;
		const userData = await userModel.findById(userId);
		let cartData = await userData.cartData;
		if (cartData[itemId]) {
			if (cartData[itemId][size]) {
				cartData[itemId][size] += 1;
			} else {
				cartData[itemId][size] = 1;
			}
		} else {
			cartData[itemId] = {};
			cartData[itemId][size] = 1;
		}

		await userModel.findByIdAndUpdate(userId, { cartData });
		response.json({
			success: true,
			message: "Added to Cart",
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// Update cart
const updateCart = async (request, response) => {
	try {
		const { userId, itemId, size, quantity } = request.body;
		const userData = await userModel.findById(userId);
		let cartData = await userData.cartData;
		cartData[itemId][size] = quantity;
		await userModel.findByIdAndUpdate(userId, { cartData });
		response.json({
			success: true,
			message: "Cart Updated",
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// Get user cart data
const getUserCart = async (request, response) => {
	try {
		const { userId } = request.body;
		const userData = await userModel.findById(userId);
		let cartData = await userData.cartData;
		response.json({
			success: true,
			cartData,
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

export { addToCart, updateCart, getUserCart };
