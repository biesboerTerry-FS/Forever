// Scopes the employee self-service API to a single employee record. Employee
// tokens carry `role: "employee"` plus an `employeeId` claim and can never be
// used with the admin or shopper endpoints (and vice versa).
import jwt from "jsonwebtoken";

const employeeAuth = (request, response, next) => {
	try {
		const { token } = request.headers;
		if (!token) {
			return response.status(401).json({
				success: false,
				message: "Not authorized. Please sign in again.",
			});
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (
			!decoded ||
			typeof decoded !== "object" ||
			decoded.role !== "employee" ||
			!decoded.employeeId
		) {
			return response.status(401).json({
				success: false,
				message: "Not authorized. Please sign in again.",
			});
		}

		request.employeeAuth = { employeeId: String(decoded.employeeId) };
		next();
	} catch (error) {
		response.status(401).json({
			success: false,
			message: error.message,
		});
	}
};

export default employeeAuth;
