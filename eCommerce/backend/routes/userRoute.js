import express from "express";
import {
	loginUser,
	resgisterUser,
	adminLogin,
	googleLogin,
	demoOAuthLogin,
	forgotPassword,
	resetPassword,
	registerPushToken,
} from "../controllers/userController.js";
import authUser from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", resgisterUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.post("/google", googleLogin);
userRouter.post("/oauth/demo", demoOAuthLogin);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/push-token", authUser, registerPushToken);

export default userRouter;
