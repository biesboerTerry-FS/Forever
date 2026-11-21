import express from "express";
import { getStats } from "../controllers/adminController.js";
import { adminDemoLogin } from "../controllers/userController.js";
import adminAuth from "../middleware/adminAuth.js";
import { demoLimiter } from "../middleware/rateLimiters.js";

const adminRouter = express.Router();

// Public demo sign-in for portfolio deployments. Returns a scoped admin JWT so
// the dashboard can render with live data. Disable with ALLOW_ADMIN_DEMO=false.
adminRouter.post("/demo", demoLimiter, adminDemoLogin);
// Everything else under /api/admin is admin-only.
adminRouter.post("/stats", adminAuth, getStats);

export default adminRouter;
