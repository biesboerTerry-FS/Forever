import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
	validateHrUpsert,
	validateHrRemove,
	validateHrEmployeeUpsert,
	validateHrOrganization,
	validateHrPayrollRun,
	validateHrPerformanceNote,
} from "../middleware/validate.js";
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
import {
	getOrganization,
	saveOrganization,
	listPerformanceNotes,
	addPerformanceNote,
	runPayroll,
	listTimeOff,
} from "../controllers/hrSuiteController.js";

const hrRouter = express.Router();

// Every HR endpoint is admin-only. The public storefront and the employee
// self-service portal use different routers and are unaffected.
hrRouter.use(adminAuth);

hrRouter.get("/employees", listEmployees);
hrRouter.post("/employees/upsert", validateHrEmployeeUpsert, upsertEmployee);
hrRouter.post("/employees/remove", validateHrRemove, removeEmployee);
hrRouter.post("/employees/deactivate", validateHrRemove, removeEmployee);

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
hrRouter.post("/payroll/run", validateHrPayrollRun, runPayroll);

hrRouter.get("/reports", getReports);

// Roles & departments
hrRouter.get("/organization", getOrganization);
hrRouter.post("/organization", validateHrOrganization, saveOrganization);

// Performance notes
hrRouter.get("/performance-notes", listPerformanceNotes);
hrRouter.post("/performance-notes", validateHrPerformanceNote, addPerformanceNote);

// Schedule requests submitted by employees (admin review).
hrRouter.get("/requests", listAllRequests);
hrRouter.patch("/requests/:id", validateHrUpsert("status"), updateRequestStatus);

// Time-off approval queue (same underlying requests, reflected back to the portal).
hrRouter.get("/timeoff", listTimeOff);

export default hrRouter;
