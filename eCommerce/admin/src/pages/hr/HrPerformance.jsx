import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { addNote, fetchEmployees, fetchNotes, formatDate, todayKey } from "../../utils/hr";

const HrPerformance = ({ token }) => {
	const [searchParams] = useSearchParams();
	const employeeParam = searchParams.get("employeeId");
	const [employees, setEmployees] = useState([]);
	const [notes, setNotes] = useState([]);
	const [filter, setFilter] = useState(employeeParam || "");
	const [form, setForm] = useState({
		employeeId: employeeParam || "",
		author: "Admin",
		date: todayKey(0),
		text: "",
	});
	const [busy, setBusy] = useState(false);

	const load = async () => {
		const [people, list] = await Promise.all([
			fetchEmployees(token),
			fetchNotes(token),
		]);
		setEmployees(people.employees || []);
		setNotes(list.notes || []);
	};

	useEffect(() => { load(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (!employeeParam || !employees.length) return;
		setFilter(employeeParam);
		setForm((current) => current.employeeId ? current : { ...current, employeeId: employeeParam });
	}, [employeeParam, employees]);

	const shown = useMemo(
		() => (filter ? notes.filter((note) => String(note.employeeId) === String(filter)) : notes),
		[notes, filter]
	);

	const submit = async (event) => {
		event.preventDefault();
		setBusy(true);
		try {
			const result = await addNote(token, form);
			if (result.success) {
				toast.success(result.message);
				setForm((current) => ({ ...current, text: "" }));
				await load();
			} else toast.error(result.message);
		} finally {
			setBusy(false);
		}
	};

	const input = "px-3 py-2 text-sm border rounded-lg dark:bg-gray-950 dark:border-gray-700";
	return (
		<div data-testid="hr-performance" className="space-y-5">
			<div>
				<h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Performance notes</h2>
				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Append-only feedback log with author, date and context for each employee.</p>
			</div>

			<form data-testid="hr-note-form" onSubmit={submit} className="grid gap-3 p-5 bg-white rounded-2xl shadow-sm md:grid-cols-2 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
				<label className="text-sm md:col-span-2">Employee
					<select required data-testid="hr-note-employee" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className={`${input} mt-1 w-full`}>
						<option value="">Select employee</option>
						{employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.name}</option>)}
					</select>
				</label>
				<label className="text-sm">Author<input required data-testid="hr-note-author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className={`${input} mt-1 w-full`} /></label>
				<label className="text-sm">Date<input required type="date" data-testid="hr-note-date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={`${input} mt-1 w-full`} /></label>
				<label className="text-sm md:col-span-2">Note<textarea required rows="3" data-testid="hr-note-text" placeholder="What went well, and what to work on next…" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className={`${input} mt-1 w-full`} /></label>
				<div className="md:col-span-2">
					<button type="submit" data-testid="hr-note-add" disabled={busy} className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg disabled:opacity-60 dark:bg-white dark:text-gray-900">Add note</button>
				</div>
			</form>

			<div className="flex flex-wrap items-center gap-3">
				<h3 className="text-base font-medium text-gray-800 dark:text-gray-100">Notes</h3>
				<select data-testid="hr-note-filter" value={filter} onChange={(e) => setFilter(e.target.value)} className={`${input} ml-auto`}>
					<option value="">All employees</option>
					{employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.name}</option>)}
				</select>
			</div>

			<div data-testid="hr-note-list" className="grid gap-3 md:grid-cols-2">
				{shown.map((note) => (
					<article data-testid="hr-note-item" key={note._id} className="p-4 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
						<div className="flex items-start justify-between gap-3">
							<div>
								<h4 className="text-sm font-medium text-gray-800 dark:text-gray-100">{note.employeeName || "Employee"}</h4>
								<p className="text-xs text-gray-400">{note.author} · {formatDate(note.date)}</p>
							</div>
						</div>
						<p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{note.text}</p>
					</article>
				))}
				{shown.length === 0 && <p className="text-sm text-gray-500">No notes yet for this selection.</p>}
			</div>
		</div>
	);
};

export default HrPerformance;
