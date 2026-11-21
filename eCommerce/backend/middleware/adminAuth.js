// Admin-only routes. Requires an HS256 JWT carrying the role="admin" claim.
import { readToken, verifyJwt } from "./jwt.js";

const unauthorized = (response) =>
	response.status(401).json({
		success: false,
		message: "Not authorized. Please try again.",
	});

const adminAuth = (request, response, next) => {
	const token = readToken(request);
	if (!token) return unauthorized(response);

	try {
		const decoded = verifyJwt(token);

		// Admin tokens are scoped with a role claim so the password never ends
		// up inside the token payload. Shopper/employee tokens are rejected.
		if (
			!decoded ||
			typeof decoded !== "object" ||
			decoded.role !== "admin" ||
			decoded.id ||
			decoded.employeeId
		) {
			return unauthorized(response);
		}

		request.auth = { role: "admin" };
		next();
	} catch {
		return unauthorized(response);
	}
};

export default adminAuth;
