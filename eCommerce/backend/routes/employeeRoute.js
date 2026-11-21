import express from "express";
import employeeAuth from "../middleware/employeeAuth.js";
import { demoLimiter } from "../middleware/rateLimiters.js";
import { validateEmployeeProfile } from "../middleware/validate.js";
import { demoLogin, getMe, patchMe } from "../controllers/employeeController.js";
import {
	listMyRequests,
	createRequest,
} from "../controllers/workRequestController.js";

const employeeRouter = express.Router();

// Public, portfolio-only demo sign-in. The self-service routes below always
// require a token scoped to a single employee.
employeeRouter.post("/demo", demoLimiter, demoLogin);
employeeRouter.get("/me", employeeAuth, getMe);
employeeRouter.patch("/me", employeeAuth, validateEmployeeProfile, patchMe);
employeeRouter.get("/requests", employeeAuth, listMyRequests);
employeeRouter.post("/requests", employeeAuth, validateEmployeeProfile, createRequest);

export default employeeRouter;
