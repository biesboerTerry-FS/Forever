// Admin HR data layer. The backend is the source of truth; localStorage keeps
// the suite usable when the API is temporarily unavailable (demo/offline).
import axios from "axios";

const rawBackendUrl = (import.meta.env.VITE_BACKEND_URL || "").trim().replace(/\/$/, "");
export const hrBackendUrl = rawBackendUrl
	? /^https?:\/\//i.test(rawBackendUrl)
		? rawBackendUrl
		: /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(rawBackendUrl)
			? `http://${rawBackendUrl}`
			: `https://${rawBackendUrl}`
	: "";

const KEYS = {
	employees: "forever-hr-employees",
	organization: "forever-hr-organization",
	payroll: "forever-hr-payroll",
	notes: "forever-hr-performance-notes",
	timeoff: "forever-hr-timeoff",
};

const day = 24 * 60 * 60 * 1000;
const dateKey = (offset) => new Date(Date.now() + offset * day).toISOString().slice(0, 10);
const localId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const SEED_EMPLOYEES = [
	{ _id: "hr-local-alex", name: "Alex Morgan", email: "alex.manager@forever.test", role: "Store Manager", department: "Retail", status: "Active", phone: "555-0101", address: "214 Alder St, Portland, OR 97209", hourlyRate: 32, hireDate: Date.now() - 1460 * day, available: true },
	{ _id: "hr-local-jordan", name: "Jordan Lee", email: "jordan.manager@forever.test", role: "Assistant Manager", department: "Retail", status: "Active", phone: "555-0102", address: "77 Pine Ave, Apt 2B, Portland, OR 97214", hourlyRate: 28, hireDate: Date.now() - 980 * day, available: true },
	{ _id: "hr-local-sam", name: "Sam Rivera", email: "sam.staff@forever.test", role: "Sales Associate", department: "Retail", status: "Active", phone: "555-0103", address: "412 Birch Lane, Apt 3, Portland, OR 97205", hourlyRate: 20, hireDate: Date.now() - 620 * day, available: true },
	{ _id: "hr-local-taylor", name: "Taylor Kim", email: "taylor.staff@forever.test", role: "Sales Associate", department: "Retail", status: "Active", phone: "555-0104", address: "88 Cedar Street, Portland, OR 97209", hourlyRate: 19, hireDate: Date.now() - 480 * day, available: true },
	{ _id: "hr-local-casey", name: "Casey Patel", email: "casey.fulfillment@forever.test", role: "Fulfillment Specialist", department: "Operations", status: "Active", phone: "555-0105", address: "19 Willow Way, Beaverton, OR 97005", hourlyRate: 22, hireDate: Date.now() - 540 * day, available: true },
	{ _id: "hr-local-riley", name: "Riley Chen", email: "riley.support@forever.test", role: "Customer Support", department: "Support", status: "On Leave", phone: "555-0106", address: "305 Maple Court, Portland, OR 97212", hourlyRate: 21, hireDate: Date.now() - 360 * day, available: false },
	{ _id: "hr-local-morgan", name: "Morgan Brooks", email: "morgan.merch@forever.test", role: "Visual Merchandiser", department: "Merchandising", status: "Active", phone: "555-0107", address: "51 Cypress Rd, Portland, OR 97202", hourlyRate: 24, hireDate: Date.now() - 290 * day, available: true },
	{ _id: "hr-local-avery", name: "Avery Johnson", email: "avery.finance@forever.test", role: "Bookkeeper", department: "Finance", status: "Active", phone: "555-0108", address: "142 Spruce St, Lake Oswego, OR 97034", hourlyRate: 26, hireDate: Date.now() - 210 * day, available: true },
];

const SEED_ORGANIZATION = {
	departments: ["Retail", "Operations", "Support", "Merchandising", "Finance"],
	roles: ["Store Manager", "Assistant Manager", "Sales Associate", "Fulfillment Specialist", "Customer Support", "Visual Merchandiser", "Bookkeeper", "Shift Lead"],
};

const SEED_NOTES = [
	{ _id: "hr-local-note-1", employeeId: "hr-local-alex", employeeName: "Alex Morgan", author: "Jordan Lee", date: dateKey(-7), text: "Coaching cadence is excellent. New-hire onboarding checklist is now current for the whole team." },
	{ _id: "hr-local-note-2", employeeId: "hr-local-sam", employeeName: "Sam Rivera", author: "Alex Morgan", date: dateKey(-9), text: "Consistently exceeds conversion targets on weekend shifts. Strong product knowledge on the new collection." },
	{ _id: "hr-local-note-3", employeeId: "hr-local-casey", employeeName: "Casey Patel", author: "Alex Morgan", date: dateKey(-14), text: "Pick/pack accuracy above 99% for the third month running. Great attitude in the back office." },
];

const SEED_TIMEOFF = [
	{ _id: "hr-local-req-1", type: "timeoff", employeeId: "hr-local-sam", employeeName: "Sam Rivera", date: dateKey(7), endDate: dateKey(9), reason: "Family event", status: "Pending", dateSubmitted: Date.now() - day },
	{ _id: "hr-local-req-2", type: "timeoff", employeeId: "hr-local-taylor", employeeName: "Taylor Kim", date: dateKey(12), endDate: dateKey(14), reason: "Dental procedure", status: "Pending", dateSubmitted: Date.now() - 2 * day },
	{ _id: "hr-local-req-3", type: "timeoff", employeeId: "hr-local-casey", employeeName: "Casey Patel", date: dateKey(10), endDate: dateKey(10), reason: "Moving house", status: "Pending", dateSubmitted: Date.now() - 3 * day },
	{ _id: "hr-local-req-4", type: "timeoff", employeeId: "hr-local-morgan", employeeName: "Morgan Brooks", date: dateKey(18), endDate: dateKey(20), reason: "Wedding out of town", status: "Pending", dateSubmitted: Date.now() - 4 * day },
];

const SEED_PAYROLL = [];

const readLocal = (key, seed) => {
	try {
		const raw = window.localStorage.getItem(key);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (Array.isArray(seed) ? Array.isArray(parsed) : parsed && typeof parsed === "object") return parsed;
		}
		const seeded = typeof seed === "function" ? seed() : seed;
		window.localStorage.setItem(key, JSON.stringify(seeded));
		return seeded;
	} catch {
		return typeof seed === "function" ? seed() : seed;
	}
};

const writeLocal = (key, value) => {
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// storage disabled — in-memory state still works
	}
	return value;
};

export const loadHrEmployees = () => readLocal(KEYS.employees, () => SEED_EMPLOYEES.map((e) => ({ ...e })));
export const saveHrEmployees = (items) => writeLocal(KEYS.employees, items);
export const loadHrOrganization = () => readLocal(KEYS.organization, () => SEED_ORGANIZATION);
export const saveHrOrganization = (value) => writeLocal(KEYS.organization, value);
export const loadHrPayroll = () => readLocal(KEYS.payroll, SEED_PAYROLL);
export const saveHrPayroll = (items) => writeLocal(KEYS.payroll, items);
export const loadHrNotes = () => readLocal(KEYS.notes, () => SEED_NOTES.map((n) => ({ ...n })));
export const saveHrNotes = (items) => writeLocal(KEYS.notes, items);
export const loadHrTimeOff = () => readLocal(KEYS.timeoff, () => SEED_TIMEOFF.map((r) => ({ ...r })));
export const saveHrTimeOff = (items) => writeLocal(KEYS.timeoff, items);

const auth = (token) => ({ headers: { token } });
const localResult = (message, extra = {}) => ({ success: true, local: true, message, ...extra });

// ---- Reads (sync successful responses into localStorage for offline use) --
export const fetchEmployees = async (token) => {
	try {
		const res = await axios.get(hrBackendUrl + "/api/hr/employees", auth(token));
		if (res.data?.success) {
			saveHrEmployees(res.data.employees || []);
			return { success: true, employees: res.data.employees || [] };
		}
	} catch {
		// fall through to local data
	}
	return { success: true, employees: loadHrEmployees(), local: true };
};

export const fetchOrganization = async (token) => {
	try {
		const res = await axios.get(hrBackendUrl + "/api/hr/organization", auth(token));
		if (res.data?.success) {
			const value = { departments: res.data.departments || [], roles: res.data.roles || [] };
			saveHrOrganization(value);
			return { success: true, ...value };
		}
	} catch {
		// fall through
	}
	const value = loadHrOrganization();
	return { success: true, ...value, local: true };
};

export const fetchPayroll = async (token, employeeId) => {
	try {
		const query = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : "";
		const res = await axios.get(hrBackendUrl + "/api/hr/payroll" + query, auth(token));
		if (res.data?.success) {
			saveHrPayroll(res.data.payroll || []);
			return { success: true, payroll: res.data.payroll || [] };
		}
	} catch {
		// fall through
	}
	const all = loadHrPayroll();
	return {
		success: true,
		payroll: employeeId ? all.filter((p) => p.employeeId === employeeId) : all,
		local: true,
	};
};

export const fetchNotes = async (token, employeeId) => {
	try {
		const query = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : "";
		const res = await axios.get(hrBackendUrl + "/api/hr/performance-notes" + query, auth(token));
		if (res.data?.success) {
			saveHrNotes(res.data.notes || []);
			return { success: true, notes: res.data.notes || [] };
		}
	} catch {
		// fall through
	}
	const all = loadHrNotes();
	return {
		success: true,
		notes: employeeId ? all.filter((n) => n.employeeId === employeeId) : all,
		local: true,
	};
};

export const fetchTimeOff = async (token) => {
	try {
		const res = await axios.get(hrBackendUrl + "/api/hr/timeoff", auth(token));
		if (res.data?.success) {
			saveHrTimeOff(res.data.requests || []);
			return { success: true, requests: res.data.requests || [] };
		}
	} catch {
		// fall through
	}
	return { success: true, requests: loadHrTimeOff(), local: true };
};

// ---- Mutations (API first, local fallback only on network failure) -------
const mutationFallback = (error, localAction, message) => {
	if (error?.response) {
		return { success: false, message: error.response.data?.message || "Request rejected." };
	}
	return localResult(message, localAction());
};

export const saveEmployee = async (token, payload) => {
	try {
		const res = await axios.post(hrBackendUrl + "/api/hr/employees/upsert", payload, auth(token));
		if (res.data?.success) {
			await fetchEmployees(token).catch(() => {});
			return { success: true, message: res.data.message, employee: res.data.employee };
		}
		return { success: false, message: res.data?.message || "Could not save employee." };
	} catch (error) {
		return mutationFallback(error, () => {
			const items = loadHrEmployees();
			const id = payload.id || localId("hr-local");
			const record = { ...payload, _id: id, id, hourlyRate: Number(payload.hourlyRate || 0) };
			const index = items.findIndex((item) => String(item._id) === String(payload.id));
			if (index >= 0) items[index] = { ...items[index], ...record };
			else items.push(record);
			saveHrEmployees(items);
			return { employee: record };
		}, "Employee saved locally.");
	}
};

export const deactivateEmployee = async (token, id) => {
	try {
		const res = await axios.post(hrBackendUrl + "/api/hr/employees/deactivate", { id }, auth(token));
		if (res.data?.success) {
			await fetchEmployees(token).catch(() => {});
			return { success: true, message: res.data.message };
		}
		return { success: false, message: res.data?.message || "Could not deactivate employee." };
	} catch (error) {
		return mutationFallback(error, () => {
			const items = loadHrEmployees().map((item) =>
				String(item._id) === String(id) ? { ...item, status: "Inactive", available: false } : item
			);
			saveHrEmployees(items);
			return {};
		}, "Employee deactivated locally.");
	}
};

export const saveOrganization = async (token, value) => {
	try {
		const res = await axios.post(hrBackendUrl + "/api/hr/organization", value, auth(token));
		if (res.data?.success) {
			const next = { departments: res.data.departments, roles: res.data.roles };
			saveHrOrganization(next);
			return { success: true, message: res.data.message, ...next };
		}
		return { success: false, message: res.data?.message || "Could not save organization." };
	} catch (error) {
		return mutationFallback(error, () => {
			saveHrOrganization(value);
			return value;
		}, "Organization saved locally.");
	}
};

export const runPayroll = async (token, payload) => {
	try {
		const res = await axios.post(hrBackendUrl + "/api/hr/payroll/run", payload, auth(token));
		if (res.data?.success) {
			await fetchPayroll(token).catch(() => {});
			return { success: true, message: res.data.message, item: res.data.item };
		}
		return { success: false, message: res.data?.message || "Could not run payroll." };
	} catch (error) {
		return mutationFallback(error, () => {
			const items = loadHrPayroll();
			const item = { ...payload, _id: localId("hr-pay"), grossPay: Number(payload.hours || 0) * Number(payload.hourlyRate || 0) + Number(payload.bonus || 0), netPay: 0, status: "Paid", createdAt: Date.now() };
			item.netPay = item.grossPay - Number(payload.deductions || 0);
			saveHrPayroll([item, ...items]);
			return { item };
		}, "Demo pay run saved locally.");
	}
};

export const addNote = async (token, payload) => {
	try {
		const res = await axios.post(hrBackendUrl + "/api/hr/performance-notes", payload, auth(token));
		if (res.data?.success) {
			await fetchNotes(token).catch(() => {});
			return { success: true, message: res.data.message, note: res.data.note };
		}
		return { success: false, message: res.data?.message || "Could not add note." };
	} catch (error) {
		return mutationFallback(error, () => {
			const notes = loadHrNotes();
			const note = { ...payload, _id: localId("hr-note"), createdAt: Date.now() };
			saveHrNotes([note, ...notes]);
			return { note };
		}, "Note added locally.");
	}
};

export const setTimeOffStatus = async (token, id, status) => {
	try {
		const res = await axios.patch(`${hrBackendUrl}/api/hr/requests/${id}`, { status }, auth(token));
		if (res.data?.success) {
			await fetchTimeOff(token).catch(() => {});
			return { success: true, message: `Request ${status.toLowerCase()}.` };
		}
		return { success: false, message: res.data?.message || "Could not update request." };
	} catch (error) {
		return mutationFallback(error, () => {
			const items = loadHrTimeOff().map((item) =>
				String(item._id) === String(id) ? { ...item, status } : item
			);
			saveHrTimeOff(items);
			return {};
		}, `Request ${status.toLowerCase()} locally.`);
	}
};

export const formatDate = (value) => {
	if (!value) return "—";
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
};

export const todayKey = dateKey;
