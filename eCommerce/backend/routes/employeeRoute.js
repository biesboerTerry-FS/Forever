import express from "express";
import employeeAuth from "../middleware/employeeAuth.js";
import { demoLogin, getMe, patchMe } from "../controllers/employeeController.js";

const employeeRouter = express.Router();

// Public, portfolio-only demo sign-in. The self-service routes below always
// require a token scoped to a single employee.
employeeRouter.post("/demo", demoLogin);
employeeRouter.get("/me", employeeAuth, getMe);
employeeRouter.patch("/me", employeeAuth, patchMe);

export default employeeRouter;
