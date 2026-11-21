import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEmployees, fetchOrganization, formatDate } from "../../utils/hr";

const StatusBadge = ({ status }) => {
	const value = String(status || "Active");
	const color =
		value === "Active"
			? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300"
			: value === "On Leave"
				? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
				: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
	return <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${color}`}>{value}</span>;
};

const HrDirectory = ({ token }) => {
	const navigate = useNavigate();
	const [employees, setEmployees] = useState([]);
	const [departments, setDepartments] = useState([]);
	const [query, setQuery] = useState("");
	const [department, setDepartment] = useState("");
	const [status, setStatus] = useState("");
	const [selectedId, setSelectedId] = useState(null);

	useEffect(() => {
		let active = true;
		const load = async () => {
			const [people, org] = await Promise.all([
				fetchEmployees(token),
				fetchOrganization(token),
			]);
			if (!active) return;
			setEmployees(people.employees || []);
			setDepartments(org.departments || []);
		};
		load();
		return () => { active = false; };
	}, [token]);

	const shown = useMemo(() => {
		const term = query.trim().toLowerCase();
		return employees.filter((employee) => {
			if (department && employee.department !== department) return false;
			if (status && employee.status !== status) return false;
			if (!term) return true;
			return [employee.name, employee.role, employee.email, employee.phone, employee.department]
				.some((value) => String(value || "").toLowerCase().includes(term));
		});
	}, [employees, query, department, status]);

	const selected = employees.find((employee) => String(employee._id) === String(selectedId));

	const cell = "px-4 py-3 align-top";
	return (
		<div data-testid="hr-directory" className="space-y-6">
			<div>
				<h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Employee directory</h2>
				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
					Search and review every team member. {shown.length} of {employees.length} employees shown.
				</p>
			</div>

			<div className="grid gap-3 sm:grid-cols-3">
				<div className="p-4 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
					<p className="text-xs uppercase tracking-wide text-gray-400">Total employees</p>
					<p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-gray-100">{employees.length}</p>
				</div>
				<div className="p-4 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
					<p className="text-xs uppercase tracking-wide text-gray-400">Active</p>
					<p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
						{employees.filter((e) => e.status === "Active").length}
					</p>
				</div>
				<div className="p-4 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
					<p className="text-xs uppercase tracking-wide text-gray-400">Departments</p>
					<p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-gray-100">
						{new Set(employees.map((e) => e.department).filter(Boolean)).size}
					</p>
				</div>
			</div>

			<div className="flex flex-wrap gap-3">
				<input
					data-testid="hr-directory-search"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Search name, email, role or department…"
					className="flex-1 min-w-[220px] px-3 py-2 text-sm border rounded-lg dark:bg-gray-950 dark:border-gray-700"
				/>
				<select
					data-testid="hr-directory-department"
					value={department}
					onChange={(event) => setDepartment(event.target.value)}
					className="px-3 py-2 text-sm border rounded-lg dark:bg-gray-950 dark:border-gray-700"
				>
					<option value="">All departments</option>
					{departments.map((item) => <option key={item} value={item}>{item}</option>)}
				</select>
				<select
					data-testid="hr-directory-status"
					value={status}
					onChange={(event) => setStatus(event.target.value)}
					className="px-3 py-2 text-sm border rounded-lg dark:bg-gray-950 dark:border-gray-700"
				>
					<option value="">All statuses</option>
					<option>Active</option>
					<option>On Leave</option>
					<option>Inactive</option>
				</select>
			</div>

			<div className="overflow-x-auto bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
				<table data-testid="hr-directory-table" className="w-full text-sm">
					<thead className="text-xs text-left text-gray-500 uppercase dark:text-gray-400">
						<tr>
							<th className="px-4 py-3">Name</th>
							<th className="px-4 py-3">Role / position</th>
							<th className="px-4 py-3">Department</th>
							<th className="px-4 py-3">Email</th>
							<th className="px-4 py-3">Phone</th>
							<th className="px-4 py-3">Address</th>
							<th className="px-4 py-3">Pay rate</th>
							<th className="px-4 py-3">Status</th>
							<th className="px-4 py-3">Details</th>
						</tr>
					</thead>
					<tbody>
						{shown.map((employee) => (
							<tr data-testid="hr-directory-row" key={employee._id} className="border-t dark:border-gray-800">
								<td className={`${cell} font-medium whitespace-nowrap`}>{employee.name}</td>
								<td className={cell}>{employee.role || "—"}</td>
								<td className={cell}>{employee.department || "—"}</td>
								<td className={cell}>{employee.email}</td>
								<td className={`${cell} whitespace-nowrap`}>{employee.phone || "—"}</td>
								<td className={`${cell} max-w-[220px]`}>{employee.address || "—"}</td>
								<td className={`${cell} whitespace-nowrap`}>${Number(employee.hourlyRate || 0).toFixed(2)}/hr</td>
								<td className={cell}><StatusBadge status={employee.status} /></td>
								<td className={cell}>
									<button
										type="button"
										onClick={() => setSelectedId(employee._id)}
										className="text-blue-600 hover:underline dark:text-blue-400"
									>
										View
									</button>
								</td>
							</tr>
						))}
						{shown.length === 0 && (
							<tr><td colSpan="9" className="px-4 py-8 text-center text-gray-500">No employees match your filters.</td></tr>
						)}
					</tbody>
				</table>
			</div>

			{selected && (
				<div data-testid="hr-employee-detail" className="p-5 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
					<div className="flex flex-wrap items-start justify-between gap-3">
						<div>
							<h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">{selected.name}</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">{selected.role} · {selected.department}</p>
						</div>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => navigate(`/hr/employees?edit=${selected._id}`)}
								className="px-3 py-2 text-sm border rounded-lg dark:border-gray-700"
							>
								Edit employee
							</button>
							<button
								type="button"
								onClick={() => navigate(`/hr/payroll?employeeId=${selected._id}`)}
								className="px-3 py-2 text-sm border rounded-lg dark:border-gray-700"
							>
								Payroll history
							</button>
							<button
								type="button"
								onClick={() => navigate(`/hr/performance?employeeId=${selected._id}`)}
								className="px-3 py-2 text-sm border rounded-lg dark:border-gray-700"
							>
								Performance notes
							</button>
						</div>
					</div>
					<dl className="grid gap-4 mt-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
						{[
							["Email", selected.email],
							["Phone", selected.phone],
							["Address", selected.address],
							["Pay rate", `$${Number(selected.hourlyRate || 0).toFixed(2)}/hr`],
							["Status", selected.status],
							["Hire date", selected.hireDate ? formatDate(Number(selected.hireDate)) : "—"],
						].map(([label, value]) => (
							<div key={label}>
								<dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
								<dd className="mt-1 text-gray-800 dark:text-gray-100">{value || "—"}</dd>
							</div>
						))}
					</dl>
				</div>
			)}
		</div>
	);
};

export default HrDirectory;
