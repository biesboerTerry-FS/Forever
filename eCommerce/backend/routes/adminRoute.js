import express from "express";
import { getStats } from "../controllers/adminController.js";
import { adminDemoLogin } from "../controllers/userController.js";
import adminAuth from "../middleware/adminAuth.js";

const adminRouter = express.Router();

// Public demo sign-in for portfolio deployments. Returns a scoped admin JWT so
// the dashboard can render with live data. Disable with ALLOW_ADMIN_DEMO=false.
adminRouter.post("/demo", adminDemoLogin);
adminRouter.post("/stats", adminAuth, getStats);

export default adminRouter;
