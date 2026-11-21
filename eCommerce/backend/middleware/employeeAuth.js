// Scopes the employee self-service API to a single employee record. Employee
// tokens carry `role: "employee"` plus an `employeeId` claim and can never be
// used with the admin or shopper endpoints (and vice versa).
import { readToken, verifyJwt } from "./jwt.js";

const unauthorized = (response) =>
	response.status(401).json({
		success: false,
		message: "Not authorized. Please sign in again.",
	});

const employeeAuth = (request, response, next) => {
	const token = readToken(request);
	if (!token) return unauthorized(response);

	try {
		const decoded = verifyJwt(token);
		if (
			!decoded ||
			typeof decoded !== "object" ||
			decoded.role !== "employee" ||
			!decoded.employeeId ||
			decoded.id
		) {
			return unauthorized(response);
		}

		request.employeeAuth = { employeeId: String(decoded.employeeId) };
		request.auth = { role: "employee", employeeId: String(decoded.employeeId) };
		next();
	} catch {
		return unauthorized(response);
	}
};

export default employeeAuth;
