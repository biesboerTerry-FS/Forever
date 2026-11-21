// Employee self-service: a deliberately small, read-mostly API. Every query is
// scoped to the employee in the signed token; nothing here can reach orders,
// revenue, inventory, payroll or another employee's record.
import jwt from "jsonwebtoken";
import employeeModel from "../models/employeeModel.js";
import scheduleModel from "../models/scheduleModel.js";

// Two seeded demo employees are available to the portfolio demo sign-in.
const DEMO_EMPLOYEES = {
	"sam.staff@forever.test": {
		name: "Sam Rivera",
		role: "Sales Associate",
		department: "Retail",
		phone: "555-0103",
		address: "412 Birch Lane, Apt 3, Portland, OR 97205",
	},
	"taylor.staff@forever.test": {
		name: "Taylor Kim",
		role: "Sales Associate",
		department: "Retail",
		phone: "555-0104",
		address: "88 Cedar Street, Portland, OR 97209",
	},
};
const DEFAULT_DEMO_EMAIL = "sam.staff@forever.test";

// Only these fields are ever returned to an employee.
const publicProfile = (employee) => ({
	id: String(employee._id),
	name: employee.name,
	role: employee.role,
	position: employee.role,
	email: employee.email,
	phone: employee.phone || "",
	address: employee.address || "",
});

const signEmployeeToken = (employee) =>
	jwt.sign(
		{ role: "employee", employeeId: String(employee._id) },
		process.env.JWT_SECRET,
		{ expiresIn: "12h" }
	);

// POST /api/employee/demo — public, portfolio-only sign-in. Disable with
// ALLOW_EMPLOYEE_DEMO=false. Returns a role-scoped JWT and a minimal profile.
export const demoLogin = async (request, response) => {
	try {
		if (process.env.ALLOW_EMPLOYEE_DEMO === "false") {
			return response.status(403).json({
				success: false,
				message: "Demo employee sign-in is disabled",
			});
		}

		const requested = String(request.body?.email || "")
			.trim()
			.toLowerCase();
		const email = DEMO_EMPLOYEES[requested] ? requested : DEFAULT_DEMO_EMAIL;
		const demo = DEMO_EMPLOYEES[email];

		let employee = await employeeModel.findOne({ email });
		if (!employee) {
			employee = await employeeModel.create({ ...demo, email, status: "Active" });
		} else if (!employee.address) {
			// Existing demo records predate the address field — backfill just
			// these two seeded employees so the portal has something to show.
			employee.address = demo.address;
			await employee.save();
		}

		return response.json({
			success: true,
			demo: true,
			token: signEmployeeToken(employee),
			employee: publicProfile(employee),
		});
	} catch (error) {
		console.log(error);
		return response.json({ success: false, message: error.message });
	}
};

// GET /api/employee/me — own profile and own upcoming shifts only.
export const getMe = async (request, response) => {
	try {
		const { employeeId } = request.employeeAuth;
		const employee = await employeeModel.findById(employeeId);
		if (!employee) {
			return response.status(404).json({
				success: false,
				message: "Employee not found.",
			});
		}

		const today = new Date().toISOString().slice(0, 10);
		const schedules = await scheduleModel
			.find({
				date: { $gte: today },
				$or: [
					{ employeeId: String(employee._id) },
					{ employeeName: employee.name },
				],
			})
			.sort({ date: 1, startTime: 1 })
			.limit(10)
			.lean();

		return response.json({
			success: true,
			employee: publicProfile(employee),
			schedule: schedules.map((shift) => ({
				date: shift.date,
				startTime: shift.startTime,
				endTime: shift.endTime,
				location: shift.location || "Store",
				status: shift.status || "Scheduled",
			})),
		});
	} catch (error) {
		console.log(error);
		return response.json({ success: false, message: error.message });
	}
};

// PATCH /api/employee/me — only the employee's own basic details can change.
// Unknown fields (role, permissions, other staff, ids) are ignored outright.
const EDITABLE_FIELDS = ["name", "address", "phone", "email"];

export const patchMe = async (request, response) => {
	try {
		const { employeeId } = request.employeeAuth;
		const patch = {};
		for (const field of EDITABLE_FIELDS) {
			if (typeof request.body?.[field] === "string") {
				patch[field] = request.body[field].trim().slice(0, 200);
			}
		}

		if ("name" in patch && !patch.name) {
			return response.json({ success: false, message: "Name is required." });
		}
		if ("email" in patch && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patch.email)) {
			return response.json({ success: false, message: "Enter a valid email address." });
		}

		const employee = await employeeModel.findByIdAndUpdate(
			employeeId,
			patch,
			{ new: true, runValidators: true }
		);
		if (!employee) {
			return response.status(404).json({
				success: false,
				message: "Employee not found.",
			});
		}

		return response.json({
			success: true,
			employee: publicProfile(employee),
			message: "Your details were updated.",
		});
	} catch (error) {
		console.log(error);
		return response.json({ success: false, message: error.message });
	}
};
