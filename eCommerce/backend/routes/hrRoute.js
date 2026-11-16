import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
	listEmployees,
	upsertEmployee,
	removeEmployee,
	listSchedules,
	upsertSchedule,
	removeSchedule,
	listLearning,
	upsertLearning,
	removeLearning,
	listPayroll,
	upsertPayroll,
	removePayroll,
	getReports,
} from "../controllers/hrController.js";

const hrRouter = express.Router();

hrRouter.use(adminAuth);

hrRouter.get("/employees", listEmployees);
hrRouter.post("/employees/upsert", upsertEmployee);
hrRouter.post("/employees/remove", removeEmployee);

hrRouter.get("/schedules", listSchedules);
hrRouter.post("/schedules/upsert", upsertSchedule);
hrRouter.post("/schedules/remove", removeSchedule);

hrRouter.get("/learning", listLearning);
hrRouter.post("/learning/upsert", upsertLearning);
hrRouter.post("/learning/remove", removeLearning);

hrRouter.get("/payroll", listPayroll);
hrRouter.post("/payroll/upsert", upsertPayroll);
hrRouter.post("/payroll/remove", removePayroll);

hrRouter.get("/reports", getReports);

export default hrRouter;
