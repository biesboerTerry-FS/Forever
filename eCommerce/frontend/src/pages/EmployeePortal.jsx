import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import {
	clearEmployeeSession,
	getEmployeeMe,
	readEmployeeSession,
	updateEmployeeMe,
} from "../utils/employeeSession";

const formatShiftDate = (value) => {
	const date = new Date(`${value}T00:00:00`);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString(undefined, {
		weekday: "short",
		month: "short",
		day: "numeric",
	});
};

const Field = ({ label, value, testId }) => (
	<div className="py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
		<dt className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
			{label}
		</dt>
		<dd className="mt-1 text-sm text-gray-900 dark:text-gray-100" data-testid={testId}>
			{value || "Not provided"}
		</dd>
	</div>
);

const EmployeePortal = () => {
	const { backendUrl, navigate } = useContext(ShopContext);
	const [session, setSession] = useState(readEmployeeSession);
	const [employee, setEmployee] = useState(() => session?.employee || null);
	const [schedule, setSchedule] = useState([]);
	const [offline, setOffline] = useState(Boolean(session?.offline));
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [form, setForm] = useState({
		name: "",
		address: "",
		phone: "",
		email: "",
	});

	useEffect(() => {
		if (!session) {
			setLoading(false);
			return;
		}
		let active = true;
		const load = async () => {
			try {
				const result = await getEmployeeMe(backendUrl, session);
				if (!active) return;
				setEmployee(result.employee);
				setSchedule(result.schedule);
				setOffline(result.offline);
				setSession({ ...session, employee: result.employee, offline: result.offline });
			} finally {
				if (active) setLoading(false);
			}
		};
		load();
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [backendUrl]);

	const startEditing = () => {
		setForm({
			name: employee?.name || "",
			address: employee?.address || "",
			phone: employee?.phone || "",
			email: employee?.email || "",
		});
		setEditing(true);
	};

	const handleChange = (event) => {
		setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		try {
			const result = await updateEmployeeMe(backendUrl, session, form);
			setEmployee(result.employee);
			setOffline(result.offline);
			setSession({ ...session, employee: result.employee, offline: result.offline });
			setEditing(false);
			toast.success(result.offline ? "Saved on this device (offline demo)." : result.message);
		} catch (error) {
			toast.error(error?.message || "Could not save your details.");
		}
	};

	const signOut = () => {
		clearEmployeeSession();
		setSession(null);
		setEmployee(null);
		setSchedule([]);
		setEditing(false);
		navigate("/login");
	};

	if (!session) {
		return (
			<div
				data-testid="employee-portal"
				className="mx-auto my-16 max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900"
			>
				<h1 className="text-2xl font-medium prata-regular">Employee Portal</h1>
				<p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
					Sign in with a demo employee account to view your own details and
					upcoming shifts.
				</p>
				<Link
					to="/employee-login"
					className="mt-6 inline-block rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
				>
					Try demo employee
				</Link>
			</div>
		);
	}

	if (loading) {
		return (
			<div
				data-testid="employee-portal"
				className="flex min-h-[50vh] items-center justify-center"
			>
				<div className="h-9 w-9 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800 dark:border-gray-700 dark:border-t-gray-200" />
			</div>
		);
	}

	return (
		<div data-testid="employee-portal" className="mx-auto max-w-3xl my-12">
			<div className="mb-8 flex flex-wrap items-start justify-between gap-4">
				<div>
					<p className="text-xs font-medium tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400">
						Self-service
					</p>
					<h1 className="mt-1 text-3xl font-medium prata-regular">
						Employee Portal
					</h1>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
						You can see and change your own details only.
					</p>
				</div>
				<button
					type="button"
					data-testid="employee-signout"
					onClick={signOut}
					className="rounded-full border border-gray-300 px-5 py-2 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
				>
					Sign out
				</button>
			</div>

			{offline && (
				<p
					data-testid="employee-offline-note"
					className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
				>
					Demo mode: the API is unavailable, so these details are stored on
					this device.
				</p>
			)}

			<div className="grid gap-6 md:grid-cols-2">
				<section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
					<div className="flex items-center justify-between gap-3">
						<h2 className="text-lg font-medium">My details</h2>
						{!editing && (
							<button
								type="button"
								data-testid="edit-profile"
								onClick={startEditing}
								className="text-sm font-medium underline hover:text-black dark:hover:text-white"
							>
								Edit details
							</button>
						)}
					</div>

					{editing ? (
						<form onSubmit={handleSubmit} className="mt-4 space-y-4">
							{[
								{ name: "name", label: "Full name", testId: "edit-name" },
								{ name: "address", label: "Address", testId: "edit-address" },
								{ name: "phone", label: "Phone", testId: "edit-phone" },
								{ name: "email", label: "Email", testId: "edit-email", type: "email" },
							].map((field) => (
								<label key={field.name} className="block">
									<span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
										{field.label}
									</span>
									<input
										data-testid={field.testId}
										name={field.name}
										type={field.type || "text"}
										value={form[field.name]}
										onChange={handleChange}
										required={field.name === "name"}
										className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-gray-300"
									/>
								</label>
							))}
							<div className="flex gap-3 pt-1">
								<button
									type="submit"
									data-testid="save-profile"
									className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
								>
									Save changes
								</button>
								<button
									type="button"
									onClick={() => setEditing(false)}
									className="rounded-full border border-gray-300 px-5 py-2 text-sm dark:border-gray-700"
								>
									Cancel
								</button>
							</div>
						</form>
					) : (
						<dl className="mt-2">
							<Field label="Name" value={employee?.name} testId="employee-name" />
							<Field label="Role / Position" value={employee?.role || employee?.position} testId="employee-role" />
							<Field label="Email" value={employee?.email} testId="employee-email" />
							<Field label="Phone" value={employee?.phone} testId="employee-phone" />
							<Field label="Address" value={employee?.address} testId="employee-address" />
						</dl>
					)}
				</section>

				<section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
					<h2 className="text-lg font-medium">My upcoming schedule</h2>
					<div data-testid="employee-schedule" className="mt-4 space-y-3">
						{schedule.length === 0 ? (
							<p className="text-sm text-gray-600 dark:text-gray-300">
								No upcoming shifts scheduled.
							</p>
						) : (
							schedule.map((shift, index) => (
								<div
									key={`${shift.date}-${shift.startTime}-${index}`}
									className="rounded-lg bg-gray-50 px-4 py-3 text-sm dark:bg-gray-800/60"
								>
									<p className="font-medium text-gray-900 dark:text-gray-100">
										{formatShiftDate(shift.date)}
									</p>
									<p className="mt-0.5 text-gray-600 dark:text-gray-300">
										{shift.startTime} – {shift.endTime} · {shift.location}
									</p>
								</div>
							))
						)}
					</div>
				</section>
			</div>
		</div>
	);
};

export default EmployeePortal;
