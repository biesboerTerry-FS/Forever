import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
	fetchEmployees,
	fetchPayroll,
	runPayroll,
	todayKey,
} from "../../utils/hr";

const HrPayroll = ({ token }) => {
	const [searchParams] = useSearchParams();
	const employeeParam = searchParams.get("employeeId");
	const [employees, setEmployees] = useState([]);
	const [payroll, setPayroll] = useState([]);
	const [filter, setFilter] = useState(employeeParam || "");
	const [form, setForm] = useState({
		employeeId: employeeParam || "",
		periodStart: todayKey(-15),
		periodEnd: todayKey(-1),
		hours: "80",
		hourlyRate: "",
		bonus: "0",
		deductions: "0",
	});
	const [busy, setBusy] = useState(false);

	const load = async () => {
		const [people, runs] = await Promise.all([
			fetchEmployees(token),
			fetchPayroll(token),
		]);
		setEmployees(people.employees || []);
		setPayroll(runs.payroll || []);
	};

	useEffect(() => { load(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (!employeeParam || !employees.length) return;
		setFilter(employeeParam);
		setForm((current) => current.employeeId ? current : { ...current, employeeId: employeeParam });
	}, [employeeParam, employees]);

	const onEmployee = (id) => {
		const employee = employees.find((item) => String(item._id) === String(id));
		setForm((current) => ({
			...current,
			employeeId: id,
			hourlyRate: employee ? String(employee.hourlyRate ?? 0) : current.hourlyRate,
		}));
	};

	const preview = useMemo(() => {
		const gross = Number(form.hours || 0) * Number(form.hourlyRate || 0) + Number(form.bonus || 0);
		return { gross, net: gross - Number(form.deductions || 0) };
	}, [form]);

	const submit = async (event) => {
		event.preventDefault();
		setBusy(true);
		try {
			const result = await runPayroll(token, {
				...form,
				hours: Number(form.hours || 0),
				hourlyRate: Number(form.hourlyRate || 0),
				bonus: Number(form.bonus || 0),
				deductions: Number(form.deductions || 0),
			});
			if (result.success) {
				toast.success(result.message);
				await load();
			} else toast.error(result.message);
		} finally {
			setBusy(false);
		}
	};

	const shown = filter ? payroll.filter((item) => String(item.employeeId) === String(filter)) : payroll;
	const input = "px-3 py-2 text-sm border rounded-lg dark:bg-gray-950 dark:border-gray-700";
	return (
		<div data-testid="hr-payroll" className="space-y-5">
			<div>
				<h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Payroll</h2>
				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Review pay-run history and process a demo pay run.</p>
			</div>

			<form onSubmit={submit} data-testid="hr-payroll-run-form" className="grid gap-3 p-5 bg-white rounded-2xl shadow-sm md:grid-cols-4 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
				<div className="md:col-span-2">
					<label className="text-sm">Employee
						<select required data-testid="hr-payroll-employee" value={form.employeeId} onChange={(e) => onEmployee(e.target.value)} className={`${input} mt-1 w-full`}>
							<option value="">Select employee</option>
							{employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.name} · {employee.department}</option>)}
						</select>
					</label>
				</div>
				<label className="text-sm">Period start<input required type="date" data-testid="hr-payroll-period-start" value={form.periodStart} onChange={(e) => setForm({ ...form, periodStart: e.target.value })} className={`${input} mt-1 w-full`} /></label>
				<label className="text-sm">Period end<input required type="date" data-testid="hr-payroll-period-end" value={form.periodEnd} onChange={(e) => setForm({ ...form, periodEnd: e.target.value })} className={`${input} mt-1 w-full`} /></label>
				<label className="text-sm">Hours<input type="number" min="0" step="0.5" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} className={`${input} mt-1 w-full`} /></label>
				<label className="text-sm">Hourly rate ($)<input type="number" min="0" step="0.01" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} className={`${input} mt-1 w-full`} /></label>
				<label className="text-sm">Bonus ($)<input type="number" min="0" step="0.01" value={form.bonus} onChange={(e) => setForm({ ...form, bonus: e.target.value })} className={`${input} mt-1 w-full`} /></label>
				<label className="text-sm">Deductions ($)<input type="number" min="0" step="0.01" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} className={`${input} mt-1 w-full`} /></label>
				<div className="flex items-end gap-3 md:col-span-2">
					<div className="px-3 py-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
						Net pay preview: <span data-testid="hr-payroll-preview" className="font-semibold">${preview.net.toFixed(2)}</span>
					</div>
					<button type="submit" data-testid="hr-run-payroll" disabled={busy} className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg disabled:opacity-60 dark:bg-white dark:text-gray-900">
						Run payroll
					</button>
				</div>
			</form>

			<div className="flex flex-wrap items-center gap-3">
				<h3 className="text-base font-medium text-gray-800 dark:text-gray-100">Pay-run history</h3>
				<select data-testid="hr-payroll-filter" value={filter} onChange={(e) => setFilter(e.target.value)} className={`${input} ml-auto`}>
					<option value="">All employees</option>
					{employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.name}</option>)}
				</select>
			</div>

			<div className="overflow-x-auto bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
				<table data-testid="hr-payroll-table" className="w-full text-sm">
					<thead className="text-xs text-left text-gray-500 uppercase dark:text-gray-400">
						<tr><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Period</th><th className="px-4 py-3">Hours</th><th className="px-4 py-3">Rate</th><th className="px-4 py-3">Gross pay</th><th className="px-4 py-3">Net pay</th><th className="px-4 py-3">Status</th></tr>
					</thead>
					<tbody>
						{shown.map((run) => (
							<tr data-testid="hr-payroll-row" key={run._id} className="border-t dark:border-gray-800">
								<td className="px-4 py-3 font-medium">{run.employeeName}</td>
								<td className="px-4 py-3">{run.periodStart} – {run.periodEnd}</td>
								<td className="px-4 py-3">{run.hours}</td>
								<td className="px-4 py-3">${Number(run.hourlyRate || 0).toFixed(2)}</td>
								<td className="px-4 py-3">${Number(run.grossPay || 0).toFixed(2)}</td>
								<td className="px-4 py-3 font-medium">${Number(run.netPay || 0).toFixed(2)}</td>
								<td data-testid="hr-payroll-status" className="px-4 py-3">{run.status}</td>
							</tr>
						))}
						{shown.length === 0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No pay runs for this selection.</td></tr>}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default HrPayroll;
