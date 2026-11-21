// Realistic demo content for the admin HR suite. Everything is inserted with
// stable seed keys, so calling this repeatedly (Vercel cold starts included)
// never duplicates rows or overwrites changes an admin has made.
import employeeModel from "../models/employeeModel.js";
import payrollModel from "../models/payrollModel.js";
import workRequestModel from "../models/workRequestModel.js";
import hrSettingModel from "../models/hrSettingModel.js";
import performanceNoteModel from "../models/performanceNoteModel.js";

const day = 24 * 60 * 60 * 1000;
const dateKey = (offset) =>
	new Date(Date.now() + offset * day).toISOString().slice(0, 10);

const PEOPLE = [
	{
		name: "Alex Morgan",
		email: "alex.manager@forever.test",
		role: "Store Manager",
		department: "Retail",
		status: "Active",
		phone: "555-0101",
		address: "214 Alder St, Portland, OR 97209",
		hourlyRate: 32,
		hireDate: Date.now() - 1460 * day,
	},
	{
		name: "Jordan Lee",
		email: "jordan.manager@forever.test",
		role: "Assistant Manager",
		department: "Retail",
		status: "Active",
		phone: "555-0102",
		address: "77 Pine Ave, Apt 2B, Portland, OR 97214",
		hourlyRate: 28,
		hireDate: Date.now() - 980 * day,
	},
	{
		name: "Sam Rivera",
		email: "sam.staff@forever.test",
		role: "Sales Associate",
		department: "Retail",
		status: "Active",
		phone: "555-0103",
		address: "412 Birch Lane, Apt 3, Portland, OR 97205",
		hourlyRate: 20,
		hireDate: Date.now() - 620 * day,
	},
	{
		name: "Taylor Kim",
		email: "taylor.staff@forever.test",
		role: "Sales Associate",
		department: "Retail",
		status: "Active",
		phone: "555-0104",
		address: "88 Cedar Street, Portland, OR 97209",
		hourlyRate: 19,
		hireDate: Date.now() - 480 * day,
	},
	{
		name: "Casey Patel",
		email: "casey.fulfillment@forever.test",
		role: "Fulfillment Specialist",
		department: "Operations",
		status: "Active",
		phone: "555-0105",
		address: "19 Willow Way, Beaverton, OR 97005",
		hourlyRate: 22,
		hireDate: Date.now() - 540 * day,
	},
	{
		name: "Riley Chen",
		email: "riley.support@forever.test",
		role: "Customer Support",
		department: "Support",
		status: "On Leave",
		phone: "555-0106",
		address: "305 Maple Court, Portland, OR 97212",
		hourlyRate: 21,
		hireDate: Date.now() - 360 * day,
	},
	{
		name: "Morgan Brooks",
		email: "morgan.merch@forever.test",
		role: "Visual Merchandiser",
		department: "Merchandising",
		status: "Active",
		phone: "555-0107",
		address: "51 Cypress Rd, Portland, OR 97202",
		hourlyRate: 24,
		hireDate: Date.now() - 290 * day,
	},
	{
		name: "Avery Johnson",
		email: "avery.finance@forever.test",
		role: "Bookkeeper",
		department: "Finance",
		status: "Active",
		phone: "555-0108",
		address: "142 Spruce St, Lake Oswego, OR 97034",
		hourlyRate: 26,
		hireDate: Date.now() - 210 * day,
	},
];

const DEPARTMENTS = ["Retail", "Operations", "Support", "Merchandising", "Finance"];
const ROLES = [
	"Store Manager",
	"Assistant Manager",
	"Sales Associate",
	"Fulfillment Specialist",
	"Customer Support",
	"Visual Merchandiser",
	"Bookkeeper",
	"Shift Lead",
];

const NOTES = {
	"alex.manager@forever.test": [
		{ author: "Jordan Lee", text: "Coaching cadence is excellent. New-hire onboarding checklist is now current for the whole team." },
		{ author: "Forever Ops", text: "Led the holiday floor plan rollout with zero staffing gaps across the two busiest weekends." },
	],
	"jordan.manager@forever.test": [
		{ author: "Alex Morgan", text: "Took ownership of the weekly rota and resolved all open shift-swap requests ahead of schedule." },
	],
	"sam.staff@forever.test": [
		{ author: "Alex Morgan", text: "Consistently exceeds conversion targets on weekend shifts. Strong product knowledge on the new collection." },
	],
	"taylor.staff@forever.test": [
		{ author: "Jordan Lee", text: "Reliable opener and a calm presence at the register. Recently trained on returns and exchanges." },
	],
	"casey.fulfillment@forever.test": [
		{ author: "Alex Morgan", text: "Pick/pack accuracy above 99% for the third month running. Great attitude in the back office." },
	],
	"riley.support@forever.test": [
		{ author: "Jordan Lee", text: "Handles difficult customer conversations with patience. Customer satisfaction scores remain high." },
	],
	"morgan.merch@forever.test": [
		{ author: "Alex Morgan", text: "Window refresh drove a noticeable lift in foot traffic. Documented the display standards for the team." },
	],
	"avery.finance@forever.test": [
		{ author: "Forever Ops", text: "Closed last quarter early and flagged two duplicate invoices before payment. Detail-oriented and dependable." },
	],
};

// Requests here are extra to the three portal-seeded demo requests and use
// their own seed keys, so both surfaces can coexist safely.
const REQUESTS = [
	{ email: "sam.staff@forever.test", type: "timeoff", offset: 7, endOffset: 9, reason: "Family event", status: "Pending" },
	{ email: "taylor.staff@forever.test", type: "timeoff", offset: 12, endOffset: 14, reason: "Dental procedure", status: "Pending" },
	{ email: "casey.fulfillment@forever.test", type: "timeoff", offset: 10, endOffset: 10, reason: "Moving house", status: "Pending" },
	{ email: "morgan.merch@forever.test", type: "timeoff", offset: 18, endOffset: 20, reason: "Wedding out of town", status: "Pending" },
	{ email: "avery.finance@forever.test", type: "timeoff", offset: 4, endOffset: 4, reason: "Quarterly accounting conference", status: "Pending" },
	{ email: "riley.support@forever.test", type: "timeoff", offset: -6, endOffset: -4, reason: "Medical leave", status: "Approved" },
	{ email: "alex.manager@forever.test", type: "timeoff", offset: 2, endOffset: 3, reason: "Annual leave", status: "Approved" },
	{ email: "jordan.manager@forever.test", type: "shift", offset: 6, endOffset: 6, reason: "Cover the evening closing shift", status: "Pending" },
];

let seedPromise = null;

const seed = async () => {
	// 1. Employees — enrich the existing seeded records (addresses were added
	//    later) and add the two missing departments only when absent.
	for (const person of PEOPLE) {
		const existing = await employeeModel.findOne({ email: person.email });
		if (!existing) {
			await employeeModel.create(person);
			continue;
		}
		const patch = {};
		if (!existing.address) patch.address = person.address;
		if (!existing.phone) patch.phone = person.phone;
		if (!existing.hourlyRate) patch.hourlyRate = person.hourlyRate;
		if (!existing.hireDate) patch.hireDate = person.hireDate;
		if (Object.keys(patch).length) {
			await employeeModel.updateOne({ _id: existing._id }, { $set: patch });
		}
	}
	const employeesByEmail = Object.fromEntries(
		(await employeeModel.find({ email: { $in: PEOPLE.map((p) => p.email) } }).lean()).map(
			(e) => [e.email, e]
		)
	);

	// 2. Department and role labels.
	await hrSettingModel.updateOne(
		{ key: "org" },
		{
			$setOnInsert: {
				key: "org",
				departments: DEPARTMENTS,
				roles: ROLES,
				updatedAt: Date.now(),
			},
		},
		{ upsert: true }
	);

	// 3. Payroll history — two completed periods per employee.
	const periods = [
		{ start: dateKey(-45), end: dateKey(-31), status: "Paid" },
		{ start: dateKey(-15), end: dateKey(-1), status: "Approved" },
	];
	for (const person of PEOPLE) {
		const employee = employeesByEmail[person.email];
		if (!employee) continue;
		for (let index = 0; index < periods.length; index += 1) {
			const period = periods[index];
			const hours = 80;
			const bonus = index === 1 ? 120 : 0;
			const deductions = index === 1 ? 95 : 60;
			const grossPay = hours * person.hourlyRate + bonus;
			await payrollModel.updateOne(
				{ seedKey: `hr-payroll-${person.email}-${index}` },
				{
					$setOnInsert: {
						employeeId: String(employee._id),
						employeeName: employee.name,
						periodStart: period.start,
						periodEnd: period.end,
						hours,
						hourlyRate: person.hourlyRate,
						bonus,
						deductions,
						grossPay,
						netPay: grossPay - deductions,
						status: period.status,
						notes: index === 1 ? "Regular semi-monthly pay run" : "Prior period, settled",
						createdAt: Date.now() - (index === 0 ? 30 : 5) * day,
						seedKey: `hr-payroll-${person.email}-${index}`,
					},
				},
				{ upsert: true }
			);
		}
	}

	// 4. Performance notes (author, date and text).
	for (const [email, entries] of Object.entries(NOTES)) {
		const employee = employeesByEmail[email];
		if (!employee) continue;
		for (let index = 0; index < entries.length; index += 1) {
			const note = entries[index];
			await performanceNoteModel.updateOne(
				{ seedKey: `hr-note-${email}-${index}` },
				{
					$setOnInsert: {
						employeeId: String(employee._id),
						employeeName: employee.name,
						author: note.author,
						text: note.text,
						date: dateKey(-7 - index * 21),
						createdAt: Date.now() - (7 + index * 21) * day,
						seedKey: `hr-note-${email}-${index}`,
					},
				},
				{ upsert: true }
			);
		}
	}

	// 5. Time-off / shift-swap requests for the admin approval queue.
	for (let index = 0; index < REQUESTS.length; index += 1) {
		const request = REQUESTS[index];
		const employee = employeesByEmail[request.email];
		if (!employee) continue;
		await workRequestModel.updateOne(
			{ seedKey: `hr-request-${index}` },
			{
				$setOnInsert: {
					type: request.type,
					employeeId: String(employee._id),
					employeeName: employee.name,
					date: dateKey(request.offset),
					endDate: request.endOffset === request.offset ? "" : dateKey(request.endOffset),
					reason: request.reason,
					status: request.status,
					dateSubmitted: Date.now() - (index + 1) * day,
					demo: true,
					seedKey: `hr-request-${index}`,
				},
			},
			{ upsert: true }
		);
	}
};

// One seed per serverless warm-up, reset on failure so a transient DB issue
// does not permanently disable the demo data.
export const ensureHrDemoData = () => {
	if (!seedPromise) {
		seedPromise = seed().catch((error) => {
			seedPromise = null;
			throw error;
		});
	}
	return seedPromise;
};
