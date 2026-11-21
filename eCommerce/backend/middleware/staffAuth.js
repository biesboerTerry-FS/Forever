// Staff routes (shared ops data): accepts either a role-scoped admin JWT or an
// employee JWT. Shopper tokens and unauthenticated requests are rejected.
import { readToken, verifyJwt } from "./jwt.js";

const unauthorized = (response) =>
	response.status(401).json({
		success: false,
		message: "Not authorized. Please sign in again.",
	});

const staffAuth = (request, response, next) => {
	const token = readToken(request);
	if (!token) return unauthorized(response);

	try {
		const decoded = verifyJwt(token);
		if (!decoded || typeof decoded !== "object") return unauthorized(response);

		if (decoded.role === "admin" && !decoded.id && !decoded.employeeId) {
			request.staff = { role: "admin" };
			request.auth = { role: "admin" };
			return next();
		}

		if (decoded.role === "employee" && decoded.employeeId && !decoded.id) {
			const employeeId = String(decoded.employeeId);
			request.staff = { role: "employee", employeeId };
			request.employeeAuth = { employeeId };
			request.auth = { role: "employee", employeeId };
			return next();
		}

		return unauthorized(response);
	} catch {
		return unauthorized(response);
	}
};

export default staffAuth;
