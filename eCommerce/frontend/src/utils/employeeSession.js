import axios from "axios";

// Employee portal session. Kept separate from the shopper's Clerk/backend
// token so trying the demo employee never signs the shopper in or out.
const SESSION_KEY = "forever-employee-session";

const dateKey = (date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const fallbackProfile = () => ({
	id: "demo-employee-sam",
	name: "Sam Rivera",
	role: "Sales Associate",
	position: "Sales Associate",
	email: "sam.staff@forever.test",
	phone: "555-0103",
	address: "412 Birch Lane, Apt 3, Portland, OR 97205",
});

const fallbackSchedule = () => {
	const shifts = [];
	const today = new Date();
	for (let i = 0; i < 3; i++) {
		const day = new Date(today);
		day.setDate(today.getDate() + i);
		shifts.push({
			date: dateKey(day),
			startTime: i % 2 === 0 ? "09:00" : "10:00",
			endTime: i % 2 === 0 ? "17:00" : "18:00",
			location: "Store",
			status: "Scheduled",
		});
	}
	return shifts;
};

export const readEmployeeSession = () => {
	try {
		const raw = localStorage.getItem(SESSION_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
};

export const saveEmployeeSession = (session) => {
	try {
		localStorage.setItem(SESSION_KEY, JSON.stringify(session));
	} catch {
		// Storage can be disabled (private mode) — the in-memory flow still works.
	}
	return session;
};

export const clearEmployeeSession = () => {
	try {
		localStorage.removeItem(SESSION_KEY);
	} catch {
		// ignore
	}
};

// Signs in as a seeded demo employee. If the API is unreachable, a clearly
// offline demo profile is stored locally so the portal remains explorable.
export const demoEmployeeSignIn = async (backendUrl) => {
	let session;
	if (backendUrl) {
		try {
			const response = await axios.post(`${backendUrl}/api/employee/demo`);
			if (response.data?.success && response.data.employee) {
				session = {
					token: response.data.token || "",
					employee: response.data.employee,
					offline: false,
				};
			}
		} catch {
			// Fall through to the local demo session.
		}
	}

	if (!session) {
		session = saveEmployeeSession({
			token: "",
			employee: fallbackProfile(),
			offline: true,
		});
	} else {
		saveEmployeeSession(session);
	}
	return session;
};

export const getEmployeeMe = async (backendUrl, session) => {
	if (session?.token && backendUrl) {
		try {
			const response = await axios.get(`${backendUrl}/api/employee/me`, {
				headers: { token: session.token },
			});
			if (response.data?.success && response.data.employee) {
				const next = {
					...session,
					employee: response.data.employee,
					offline: false,
				};
				saveEmployeeSession(next);
				return {
					employee: response.data.employee,
					schedule: response.data.schedule || [],
					offline: false,
				};
			}
		} catch {
			// Fall through to the cached/offline view.
		}
	}

	return {
		employee: session?.employee || fallbackProfile(),
		schedule: fallbackSchedule(),
		offline: true,
	};
};

// Only name / address / phone / email are sent. The API also whitelists them.
export const updateEmployeeMe = async (backendUrl, session, patch) => {
	const allowed = {
		name: patch.name,
		address: patch.address,
		phone: patch.phone,
		email: patch.email,
	};

	let employee = { ...(session?.employee || fallbackProfile()), ...allowed };
	let offline = !session?.token || !backendUrl;
	let message = "Your details were saved on this device.";

	if (!offline) {
		try {
			const response = await axios.patch(
				`${backendUrl}/api/employee/me`,
				allowed,
				{ headers: { token: session.token } }
			);
			if (response.data?.success && response.data.employee) {
				employee = response.data.employee;
				message = response.data.message || "Your details were updated.";
			} else {
				offline = true;
				message = response.data?.message || "Saved on this device only.";
			}
		} catch {
			offline = true;
		}
	}

	saveEmployeeSession({ ...session, employee, offline });
	return { employee, offline, message };
};
