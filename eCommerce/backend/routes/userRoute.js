import express from "express";
import {
	loginUser,
	resgisterUser,
	adminLogin,
	googleLogin,
	clerkLogin,
	demoOAuthLogin,
	forgotPassword,
	resetPassword,
	registerPushToken,
	removePushToken,
} from "../controllers/userController.js";
import authUser from "../middleware/auth.js";
import {
	validateLogin,
	validateRegister,
	validateAdminLogin,
	validateClerkLogin,
	validateGoogleLogin,
	validateForgotPassword,
	validateResetPassword,
	validatePushToken,
} from "../middleware/validate.js";
import { demoLimiter } from "../middleware/rateLimiters.js";

const userRouter = express.Router();

// Public authentication endpoints. They mint tokens; they never consume one.
userRouter.post("/register", validateRegister, resgisterUser);
userRouter.post("/login", validateLogin, loginUser);
userRouter.post("/admin", validateAdminLogin, adminLogin);
userRouter.post("/google", validateGoogleLogin, googleLogin);
userRouter.post("/clerk", validateClerkLogin, clerkLogin);
userRouter.post("/oauth/demo", demoLimiter, demoOAuthLogin);
userRouter.post("/forgot-password", validateForgotPassword, forgotPassword);
userRouter.post("/reset-password", validateResetPassword, resetPassword);

// Token-mutating endpoints require a signed-in shopper; authUser overwrites
// any client-supplied userId with the id from the verified token.
userRouter.post("/push-token", authUser, validatePushToken, registerPushToken);
userRouter.post("/push-token/remove", authUser, validatePushToken, removePushToken);

export default userRouter;
