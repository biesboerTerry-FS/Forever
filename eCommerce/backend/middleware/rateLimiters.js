// Stricter limiter for public demo/login token-minting routes. The global
// /api limiter and the /api/user auth limiter remain in place in server.js.
import rateLimit from "express-rate-limit";

export const demoLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 30,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many attempts. Please wait a few minutes and try again.",
	},
});
