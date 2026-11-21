import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
	deactivateEmployee,
	fetchEmployees,
	fetchOrganization,
	saveEmployee,
} from "../../utils/hr";

const empty = {
	name: "",
	email: "",
	role: "Sales Associate",
	department: "Retail",
	status: "Active",
	phone: "",
	address: "",
	hourlyRate: "",
};

const HrEmployees = ({ token }) => {
	const [searchParams] = useSearchParams();
	const editParam = searchParams.get("edit");
	const [employees, setEmployees] = useState([]);
	const [organization, setOrganization] = useState({ departments: [], roles: [] });
	const [form, setForm] = useState(empty);
	const [editingId, setEditingId] = useState(null);
	const [showForm, setShowForm] = useState(false);
	const [busy, setBusy] = useState(false);

	const load = async () => {
		const [people, org] = await Promise.all([
			fetchEmployees(token),
			fetchOrganization(token),
		]);
		setEmployees(people.employees || []);
		setOrganization(org);
	};

	useEffect(() => { load(); }, [token]);

	useEffect(() => {
		if (!editParam || !employees.length) return;
		const employee = employees.find((item) => String(item._id) === String(editParam));
		if (employee) startEdit(employee);
	}, [editParam, employees]); // eslint-disable-line react-hooks/exhaustive-deps

	const update = (name, value) => setForm((current) => ({ ...current, [name]: value }));

	const startAdd = () => {
		setEditingId(null);
		setForm(empty);
		setShowForm(true);
	};

	const startEdit = (employee) => {
		setEditingId(employee._id);
		setForm({
			name: employee.name || "",
			email: employee.email || "",
			role: employee.role || "Staff",
			department: employee.department || "Retail",
			status: employee.status || "Active",
			phone: employee.phone || "",
			address: employee.address || "",
			hourlyRate: employee.hourlyRate ?? "",
		});
		setShowForm(true);
	};

	const cancel = () => {
		setEditingId(null);
		setForm(empty);
		setShowForm(false);
	};

	const submit = async (event) => {
		event.preventDefault();
		setBusy(true);
		try {
			const payload = { ...form, hourlyRate: Number(form.hourlyRate || 0) };
			if (editingId) payload.id = editingId;
			const result = await saveEmployee(token, payload);
			if (result.success) {
				toast.success(result.message);
				cancel();
				await load();
			} else {
				toast.error(result.message);
			}
		} finally {
			setBusy(false);
		}
	};

	const deactivate = async (employee) => {
		setBusy(true);
		try {
			const result = await deactivateEmployee(token, employee._id);
			if (result.success) {
				toast.success(`${employee.name} is now inactive.`);
				await load();
			} else {
				toast.error(result.message);
			}
		} finally {
			setBusy(false);
		}
	};

	const input = "px-3 py-2 text-sm border rounded-lg dark:bg-gray-950 dark:border-gray-700";
	return (
		<div data-testid="hr-employees" className="space-y-5">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Employee management</h2>
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Add, update or deactivate staff. Deactivation keeps history intact — records are never deleted.
					</p>
				</div>
				<button
					type="button"
					data-testid="hr-add-employee"
					onClick={startAdd}
					className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg dark:bg-white dark:text-gray-900"
				>
					Add employee
				</button>
			</div>

			{showForm && (
				<form data-testid="hr-employee-form" onSubmit={submit} className="grid gap-3 p-5 bg-white rounded-2xl shadow-sm md:grid-cols-2 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
					<label className="text-sm">Name<input required className={`${input} mt-1 w-full`} value={form.name} onChange={(e) => update("name", e.target.value)} /></label>
					<label className="text-sm">Email<input required type="email" className={`${input} mt-1 w-full`} value={form.email} onChange={(e) => update("email", e.target.value)} /></label>
					<label className="text-sm">Role / position<input required list="hr-role-options" className={`${input} mt-1 w-full`} value={form.role} onChange={(e) => update("role", e.target.value)} /></label>
					<label className="text-sm">Department<input required list="hr-department-options" className={`${input} mt-1 w-full`} value={form.department} onChange={(e) => update("department", e.target.value)} /></label>
					<datalist id="hr-role-options">{(organization.roles || []).map((role) => <option key={role} value={role} />)}</datalist>
					<datalist id="hr-department-options">{(organization.departments || []).map((item) => <option key={item} value={item} />)}</datalist>
					<label className="text-sm">Status
						<select className={`${input} mt-1 w-full`} value={form.status} onChange={(e) => update("status", e.target.value)}>
							<option>Active</option><option>On Leave</option><option>Inactive</option>
						</select>
					</label>
					<label className="text-sm">Hourly rate ($)<input type="number" min="0" step="0.01" className={`${input} mt-1 w-full`} value={form.hourlyRate} onChange={(e) => update("hourlyRate", e.target.value)} /></label>
					<label className="text-sm">Phone<input className={`${input} mt-1 w-full`} value={form.phone} onChange={(e) => update("phone", e.target.value)} /></label>
					<label className="text-sm">Address<input className={`${input} mt-1 w-full`} value={form.address} onChange={(e) => update("address", e.target.value)} /></label>
					<div className="flex gap-2 md:col-span-2">
						<button type="submit" data-testid="hr-save-employee" disabled={busy} className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg disabled:opacity-60 dark:bg-white dark:text-gray-900">
							{editingId ? "Update employee" : "Add employee"}
						</button>
						<button type="button" onClick={cancel} className="px-4 py-2 text-sm border rounded-lg dark:border-gray-700">Cancel</button>
					</div>
				</form>
			)}

			<div className="overflow-x-auto bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
				<table data-testid="hr-employee-management-table" className="w-full text-sm">
					<thead className="text-xs text-left text-gray-500 uppercase dark:text-gray-400">
						<tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role / position</th><th className="px-4 py-3">Department</th><th className="px-4 py-3">Pay rate</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
					</thead>
					<tbody>
						{employees.map((employee) => (
							<tr data-testid="hr-employee-manage-row" key={employee._id} className="border-t dark:border-gray-800">
								<td className="px-4 py-3 font-medium">{employee.name}</td>
								<td className="px-4 py-3">{employee.role}</td>
								<td className="px-4 py-3">{employee.department}</td>
								<td className="px-4 py-3">${Number(employee.hourlyRate || 0).toFixed(2)}/hr</td>
								<td data-testid="hr-employee-status" className="px-4 py-3">{employee.status}</td>
								<td className="px-4 py-3">
									<div className="flex gap-3">
										<button type="button" onClick={() => startEdit(employee)} className="text-blue-600 dark:text-blue-400">Edit</button>
										<button
											type="button"
											data-testid="hr-deactivate-employee"
											disabled={busy || employee.status === "Inactive"}
											onClick={() => deactivate(employee)}
											className="text-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
										>
											{employee.status === "Inactive" ? "Inactive" : "Deactivate"}
										</button>
									</div>
								</td>
							</tr>
						))}
						{employees.length === 0 && <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No employees on file.</td></tr>}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default HrEmployees;
