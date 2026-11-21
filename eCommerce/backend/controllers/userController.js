import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { sendPasswordResetEmail } from "../utils/email.js";
import { getJwtSecret } from "../middleware/jwt.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const createToken = (id) => {
	return jwt.sign({ id }, getJwtSecret(), {
		algorithm: "HS256",
		expiresIn: "7d",
	});
};

// Site URL used in emails. Prefer an explicit FRONTEND_URL, then the request
// origin, then Vercel's production domain.
const frontendUrl = (request) => {
	if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL.replace(/\/$/, "");
	if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
		return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
	}
	const origin = request.headers.origin;
	if (origin && /^https?:\/\//.test(origin)) return origin.replace(/\/$/, "");
	return "http://localhost:5178";
};

//& Route for user login
const loginUser = async (request, response) => {
	// verify endpoints are working
	try {
		const email = String(request.body.email || "").trim().toLowerCase();
		const { password } = request.body;

		const user = await userModel.findOne({ email });

		if (!user) {
			return response.json({
				success: false,
				message: "User does not exist",
			});
		}

		// compares if user-entered password matches password in database
		const isMatch = await bcrypt.compare(password, user.password);

		if (isMatch) {
			// if matches this then sends token to the userSelect:
			const token = createToken(user._id);
			response.json({
				success: true,
				token,
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					picture: user.picture || "",
					provider: user.provider || "local",
				},
			});
		} else {
			response.json({
				success: false,
				message: "Invalid credentials",
			});
		}
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

//& Route for user registration
const resgisterUser = async (request, response) => {
	// verify endpoints are working
	try {
		const name = String(request.body.name || "").trim();
		const email = String(request.body.email || "").trim().toLowerCase();
		const { password } = request.body;
		// checking if user already exists or not
		const exists = await userModel.findOne({ email });
		if (exists) {
			return response.json({
				success: false,
				message: "User already exists",
			});
		}

		// validating email format and strong password
		if (!validator.isEmail(email)) {
			return response.json({
				success: false,
				message: "Please enter a valid email",
			});
		}
		if (password.length < 8) {
			return response.json({
				success: false,
				message: "Password must contain at least 8 characters",
			});
		}

		// hashing user password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const newUser = new userModel({
			name,
			email,
			password: hashedPassword,
		});

		const user = await newUser.save();

		const token = createToken(user._id);

		response.json({
			success: true,
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				picture: user.picture || "",
				provider: user.provider || "local",
			},
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// Route for admin login
const adminLogin = async (request, response) => {
	// verify endpoints are working
	try {
		const { email, password } = request.body;
		if (
			email === process.env.ADMIN_EMAIL &&
			password === process.env.ADMIN_PASSWORD
		) {
			// Scope the token to the admin role. Never embed credentials in the
			// JWT payload — it is only base64-encoded and readable by anyone.
			const token = jwt.sign({ role: "admin" }, getJwtSecret(), {
				algorithm: "HS256",
				expiresIn: "12h",
			});
			response.json({
				success: true,
				token,
			});
		} else {
			response.json({
				success: false,
				message: "Invalid credentials",
			});
		}
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

//& Demo admin sign-in (portfolio/demo deployments)
// Mints the same role-scoped admin JWT as adminLogin without requiring the
// private ADMIN_EMAIL / ADMIN_PASSWORD. This lets the deployed admin panel
// render its dashboard with live data instead of a 401 / empty screen.
// Disable for real deployments with ALLOW_ADMIN_DEMO=false.
const adminDemoLogin = async (request, response) => {
	try {
		if (process.env.ALLOW_ADMIN_DEMO === "false") {
			return response.status(403).json({
				success: false,
				message: "Demo admin sign-in is disabled",
			});
		}

		const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
			expiresIn: "12h",
		});
		return response.json({ success: true, demo: true, token });
	} catch (error) {
		console.log(error);
		return response.json({ success: false, message: error.message });
	}
};

//& Social sign-in helpers
// Finds or creates a user for a verified social identity and returns our JWT.
const signInSocialUser = async ({ email, name, picture, provider }) => {
	let user = await userModel.findOne({ email });

	if (!user) {
		// Social accounts don't have a usable password; store a random hash.
		const randomPassword = await bcrypt.hash(
			`${email}-${Date.now()}-${Math.random()}`,
			10
		);
		user = await userModel.create({
			name: name || email.split("@")[0],
			email,
			password: randomPassword,
			picture: picture || "",
			provider,
		});
	} else if (picture && !user.picture) {
		user.picture = picture;
		user.provider = provider;
		await user.save();
	}

	const token = createToken(user._id);
	return {
		token,
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			picture: user.picture || "",
			provider: user.provider || "local",
		},
	};
};

//& Google OAuth: verify the Google ID token sent by the client
const googleLogin = async (request, response) => {
	try {
		const { credential } = request.body;

		if (!process.env.GOOGLE_CLIENT_ID) {
			return response.json({
				success: false,
				message:
					"Google sign-in is not configured. Set GOOGLE_CLIENT_ID on the server.",
			});
		}
		if (!credential) {
			return response.json({
				success: false,
				message: "Missing Google credential",
			});
		}

		const ticket = await googleClient.verifyIdToken({
			idToken: credential,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();

		if (!payload?.email) {
			return response.json({
				success: false,
				message: "Google account has no email",
			});
		}

		const result = await signInSocialUser({
			email: payload.email,
			name: payload.name,
			picture: payload.picture,
			provider: "google",
		});

		response.json({ success: true, ...result });
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: "Google sign-in failed. Please try again.",
		});
	}
};

//& Clerk sign-in: verify the Clerk session token sent by the client
const clerkLogin = async (request, response) => {
	try {
		const { clerkToken } = request.body;
		if (!clerkToken) {
			return response.json({
				success: false,
				message: "Missing Clerk session token",
			});
		}
		if (!process.env.CLERK_SECRET_KEY) {
			return response.json({
				success: false,
				message: "Clerk is not configured on the server.",
			});
		}

		const session = await verifyToken(clerkToken, {
			secretKey: process.env.CLERK_SECRET_KEY,
		});

		// Session tokens do not always include email by default. If missing,
		// fetch the user from the Clerk Backend API using the subject (user id).
		let email = String(session.email || "").toLowerCase();
		let firstName = session.firstName;
		let lastName = session.lastName;
		let imageUrl = session.imageUrl;

		if (!email && session.sub) {
			try {
				const clerkUser = await clerkClient.users.getUser(session.sub);
				email = String(
					clerkUser.primaryEmailAddress?.emailAddress ||
					clerkUser.emailAddresses?.[0]?.emailAddress ||
					""
				).toLowerCase();
				firstName = firstName || clerkUser.firstName;
				lastName = lastName || clerkUser.lastName;
				imageUrl = imageUrl || clerkUser.imageUrl;
			} catch (userError) {
				console.warn("Could not fetch Clerk user:", userError.message);
			}
		}

		if (!email) {
			return response.json({
				success: false,
				message: "Clerk session does not include an email.",
			});
		}

		const name = [firstName, lastName]
			.filter(Boolean)
			.join(" ")
			.trim() || email.split("@")[0];

		const result = await signInSocialUser({
			email,
			name,
			picture: imageUrl || "",
			provider: "clerk",
		});

		response.json({ success: true, ...result });
	} catch (error) {
		console.log("clerkLogin error:", error);
		response.json({
			success: false,
			message: "Clerk sign-in failed. Please try again.",
		});
	}
};

//& Demo social sign-in
// Lets portfolio reviewers try the social-login UX when no Google client ID
// is configured. Disable with ALLOW_DEMO_OAUTH=false in any real deployment.
const demoOAuthLogin = async (request, response) => {
	try {
		// Demo sign-in is a development convenience only. It is always disabled
		// in production, even if ALLOW_DEMO_OAUTH is left at its default.
		const demoAllowed =
			process.env.NODE_ENV !== "production" &&
			process.env.ALLOW_DEMO_OAUTH !== "false";

		if (!demoAllowed) {
			return response.status(403).json({
				success: false,
				message: "Demo social sign-in is disabled",
			});
		}

		const result = await signInSocialUser({
			email: "google.demo@forever.test",
			name: "Google Demo User",
			picture: "",
			provider: "google-demo",
		});

		response.json({ success: true, demo: true, ...result });
	} catch (error) {
		console.log(error);
		response.json({ success: false, message: error.message });
	}
};

//& Forgot password: create a one-hour reset token and email the link.
// Always responds with success to avoid leaking which emails have accounts.
const forgotPassword = async (request, response) => {
	const genericResponse = {
		success: true,
		message: "If that email has an account, a reset link is on its way.",
	};
	try {
		const email = String(request.body.email || "").trim().toLowerCase();
		if (!validator.isEmail(email)) return response.json(genericResponse);

		const user = await userModel.findOne({ email });
		if (!user) return response.json(genericResponse);

		const token = crypto.randomBytes(32).toString("hex");
		user.resetToken = crypto.createHash("sha256").update(token).digest("hex");
		user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
		await user.save();

		const resetUrl = `${frontendUrl(request)}/reset-password?token=${token}`;
		await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });

		return response.json(genericResponse);
	} catch (error) {
		console.log(error);
		return response.json(genericResponse);
	}
};

//& Register an Expo push token for the signed-in user (mobile notifications).
const registerPushToken = async (request, response) => {
	try {
		const { userId, pushToken } = request.body;
		if (!userId || typeof pushToken !== "string") {
			return response.json({ success: false, message: "Missing push token" });
		}
		if (!pushToken.startsWith("ExponentPushToken")) {
			return response.json({ success: false, message: "Invalid push token" });
		}
		await userModel.findByIdAndUpdate(userId, {
			$addToSet: { pushTokens: pushToken },
		});
		return response.json({ success: true });
	} catch (error) {
		console.log(error);
		return response.json({ success: false, message: error.message });
	}
};

//& Remove an Expo push token for the signed-in user (e.g. on logout).
const removePushToken = async (request, response) => {
	try {
		const { userId, pushToken } = request.body;
		if (!userId || typeof pushToken !== "string") {
			return response.json({ success: false, message: "Missing push token" });
		}
		if (!pushToken.startsWith("ExponentPushToken")) {
			return response.json({ success: false, message: "Invalid push token" });
		}
		await userModel.findByIdAndUpdate(userId, {
			$pull: { pushTokens: pushToken },
		});
		return response.json({ success: true });
	} catch (error) {
		console.log(error);
		return response.json({ success: false, message: error.message });
	}
};

//& Signed-in shopper profile (GET/PATCH /api/user/profile).
const PROFILE_FIELDS = ["name", "email", "phone"];

const publicProfile = (user) => ({
	name: user.name || "",
	email: user.email || "",
	phone: user.phone || "",
});

const getProfile = async (request, response) => {
	try {
		const user = await userModel
			.findById(request.auth.userId)
			.select(PROFILE_FIELDS.join(" "));
		if (!user) {
			return response.status(404).json({ success: false, message: "Profile not found" });
		}
		return response.json({ success: true, profile: publicProfile(user) });
	} catch (error) {
		return response.status(500).json({ success: false, message: error.message });
	}
};

const updateProfile = async (request, response) => {
	try {
		const updates = {};
		for (const field of PROFILE_FIELDS) {
			if (request.body[field] !== undefined) {
				updates[field] = String(request.body[field]).trim();
			}
		}
		if (updates.email) {
			updates.email = updates.email.toLowerCase();
			if (!validator.isEmail(updates.email)) {
				return response.status(400).json({ success: false, message: "Please enter a valid email" });
			}
			const taken = await userModel.findOne({
				email: updates.email,
				_id: { $ne: request.auth.userId },
			});
			if (taken) {
				return response.status(400).json({ success: false, message: "That email is already in use" });
			}
		}

		const user = await userModel
			.findByIdAndUpdate(request.auth.userId, { $set: updates }, { new: true, runValidators: true })
			.select(PROFILE_FIELDS.join(" "));
		if (!user) {
			return response.status(404).json({ success: false, message: "Profile not found" });
		}
		return response.json({
			success: true,
			profile: publicProfile(user),
			message: "Profile updated.",
		});
	} catch (error) {
		return response.status(500).json({ success: false, message: error.message });
	}
};

//& Reset password using the token from the email.
const resetPassword = async (request, response) => {
	try {
		const { token, password } = request.body;
		if (!token || !password) {
			return response.json({
				success: false,
				message: "Reset link is invalid or has expired.",
			});
		}
		if (String(password).length < 8) {
			return response.json({
				success: false,
				message: "Password must contain at least 8 characters",
			});
		}

		const hashedToken = crypto
			.createHash("sha256")
			.update(String(token))
			.digest("hex");

		const user = await userModel.findOne({
			resetToken: hashedToken,
			resetTokenExpiry: { $gt: new Date() },
		});

		if (!user) {
			return response.json({
				success: false,
				message: "Reset link is invalid or has expired.",
			});
		}

		user.password = await bcrypt.hash(password, 10);
		user.resetToken = null;
		user.resetTokenExpiry = null;
		await user.save();

		return response.json({
			success: true,
			message: "Password updated. You can sign in now.",
		});
	} catch (error) {
		console.log(error);
		return response.json({ success: false, message: error.message });
	}
};

export {
	loginUser,
	resgisterUser,
	adminLogin,
	adminDemoLogin,
	googleLogin,
	clerkLogin,
	demoOAuthLogin,
	forgotPassword,
	resetPassword,
	registerPushToken,
	removePushToken,
	getProfile,
	updateProfile,
};
