import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import { validateHrUpsert, validateHrRemove } from "../middleware/validate.js";
import {
	listAllRequests,
	updateRequestStatus,
} from "../controllers/workRequestController.js";
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
hrRouter.post("/employees/upsert", validateHrUpsert("name", "email"), upsertEmployee);
hrRouter.post("/employees/remove", validateHrRemove, removeEmployee);

hrRouter.get("/schedules", listSchedules);
hrRouter.post(
	"/schedules/upsert",
	validateHrUpsert("employeeId", "date", "startTime", "endTime"),
	upsertSchedule
);
hrRouter.post("/schedules/remove", validateHrRemove, removeSchedule);

hrRouter.get("/learning", listLearning);
hrRouter.post(
	"/learning/upsert",
	validateHrUpsert("employeeId", "course"),
	upsertLearning
);
hrRouter.post("/learning/remove", validateHrRemove, removeLearning);

hrRouter.get("/payroll", listPayroll);
hrRouter.post(
	"/payroll/upsert",
	validateHrUpsert("employeeId", "periodStart", "periodEnd"),
	upsertPayroll
);
hrRouter.post("/payroll/remove", validateHrRemove, removePayroll);

hrRouter.get("/reports", getReports);

// Schedule requests submitted by employees (admin review).
hrRouter.get("/requests", listAllRequests);
hrRouter.patch("/requests/:id", validateHrUpsert("status"), updateRequestStatus);

export default hrRouter;
