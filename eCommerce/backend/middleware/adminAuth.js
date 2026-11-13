import jwt from "jsonwebtoken";

const adminAuth = async (request, response, next) => {
	try {
		const { token } = request.headers;
		if (!token) {
			return response.status(401).json({
				success: false,
				message: "Not authorized. Please try again.",
			});
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Admin tokens are scoped with a role claim so the password never ends
		// up inside the token payload.
		if (
			!decoded ||
			typeof decoded !== "object" ||
			decoded.role !== "admin"
		) {
			return response.status(401).json({
				success: false,
				message: "Not authorized. Please try again.",
			});
		}

		next();
	} catch (error) {
		response.status(401).json({
			success: false,
			message: error.message,
		});
	}
};

export default adminAuth;
