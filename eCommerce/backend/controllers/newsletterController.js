import validator from "validator";
import subscriberModel from "../models/subscriberModel.js";

// POST /api/newsletter/subscribe
const subscribe = async (request, response) => {
	try {
		const email = String(request.body.email || "").trim().toLowerCase();

		if (!validator.isEmail(email)) {
			return response.json({
				success: false,
				message: "Please enter a valid email address.",
			});
		}

		await subscriberModel.updateOne(
			{ email },
			{ $setOnInsert: { email, date: Date.now() } },
			{ upsert: true }
		);

		response.json({
			success: true,
			message: "Thanks for subscribing! Check your inbox for 20% off.",
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: "Could not subscribe right now. Please try again.",
		});
	}
};

export { subscribe };
