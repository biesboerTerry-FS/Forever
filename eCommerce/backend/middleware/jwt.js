// Shared JWT helpers. Tokens are always HS256 (jsonwebtoken's default) and the
// key comes exclusively from JWT_SECRET — there is deliberately no fallback so
// a missing key fails closed instead of silently signing with a weak value.
import jwt from "jsonwebtoken";

export const getJwtSecret = () => {
	const secret = process.env.JWT_SECRET;
	if (typeof secret !== "string" || secret.length === 0) {
		throw new Error("JWT signing key is not configured");
	}
	return secret;
};

// Pin the algorithm so a forged header cannot coerce verification into using
// a different scheme (e.g. "none" or an asymmetric algorithm).
export const verifyJwt = (token) =>
	jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });

// Accept the existing `token` header (web/admin/mobile clients) as well as a
// standard `Authorization: Bearer ...` header. Reject non-string/oversized
// values before calling into jsonwebtoken.
export const readToken = (request) => {
	const raw = request.headers.token ?? request.headers.authorization;
	if (typeof raw !== "string") return null;
	const token = raw.startsWith("Bearer ") ? raw.slice(7).trim() : raw.trim();
	return token.length > 0 && token.length <= 4096 ? token : null;
};

export const warnIfWeakJwtSecret = () => {
	const secret = process.env.JWT_SECRET;
	if (!secret) return; // getJwtSecret() reports a missing key per request.
	if (
		secret.length < 32 ||
		/^(change[-_]?me|secret|dev|test|password)/i.test(secret)
	) {
		console.warn(
			"WARNING: JWT_SECRET is missing or weak. Use a random 32+ character value in production."
		);
	}
};
