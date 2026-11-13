// Authenticates a shopper's cart/order/review requests.
import jwt from "jsonwebtoken";

const authUser = async (request, response, next) => {
	const { token } = request.headers;

	if (!token) {
		return response.status(401).json({
			success: false,
			message: "Not authorized. Login again",
		});
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Admin tokens carry a role but no user id and must not be usable as
		// shopper tokens.
		if (!decoded || typeof decoded !== "object" || !decoded.id) {
			return response.status(401).json({
				success: false,
				message: "Not authorized. Login again",
			});
		}

		request.body.userId = decoded.id;
		next();
	} catch (error) {
		response.status(401).json({
			success: false,
			message: error.message,
		});
	}
};

export default authUser;
