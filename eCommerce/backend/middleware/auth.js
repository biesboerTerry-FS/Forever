// Authenticates a shopper's cart/order/review requests.
import { readToken, verifyJwt } from "./jwt.js";

const unauthorized = (response) =>
	response.status(401).json({
		success: false,
		message: "Not authorized. Login again",
	});

const authUser = (request, response, next) => {
	const token = readToken(request);
	if (!token) return unauthorized(response);

	try {
		const decoded = verifyJwt(token);

		// Shopper tokens carry only `id`. Admin/employee tokens are role-scoped
		// and must never be accepted as shopper tokens (and vice versa).
		if (
			!decoded ||
			typeof decoded !== "object" ||
			!decoded.id ||
			decoded.role
		) {
			return unauthorized(response);
		}

		const userId = String(decoded.id);
		if (
			!request.body ||
			typeof request.body !== "object" ||
			Array.isArray(request.body)
		) {
			request.body = {};
		}
		request.body.userId = userId;
		request.auth = { userId };
		next();
	} catch {
		// Don't echo verifier internals (malformed/expired/etc.) to clients.
		return unauthorized(response);
	}
};

export default authUser;
