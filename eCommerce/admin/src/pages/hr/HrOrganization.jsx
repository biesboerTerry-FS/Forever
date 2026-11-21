import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { fetchOrganization, loadHrOrganization, saveOrganization } from "../../utils/hr";

const LabelList = ({ title, testId, addTestId, items, value, onValue, onAdd, onRemove }) => (
	<div className="p-5 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
		<h3 className="text-base font-medium text-gray-800 dark:text-gray-100">{title}</h3>
		<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Labels available across the HR suite.</p>
		<div data-testid={testId} className="flex flex-wrap gap-2 mt-4">
			{items.map((item) => (
				<span key={item} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 rounded-full dark:bg-gray-800 dark:text-gray-200">
					{item}
					<button type="button" onClick={() => onRemove(item)} aria-label={`Remove ${item}`} className="text-gray-400 hover:text-red-500">×</button>
				</span>
			))}
			{items.length === 0 && <span className="text-sm text-gray-400">No labels yet.</span>}
		</div>
		<div className="flex gap-2 mt-4">
			<input
				value={value}
				onChange={(event) => onValue(event.target.value)}
				onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); onAdd(); } }}
				placeholder={`New ${title.toLowerCase().replace(/s$/, "")}`}
				className="flex-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-950 dark:border-gray-700"
			/>
			<button type="button" data-testid={addTestId} onClick={onAdd} className="px-3 py-2 text-sm text-white bg-gray-900 rounded-lg dark:bg-white dark:text-gray-900">Add</button>
		</div>
	</div>
);

const HrOrganization = ({ token }) => {
	const initial = loadHrOrganization();
	const [departments, setDepartments] = useState(initial.departments || []);
	const [roles, setRoles] = useState(initial.roles || []);
	const [departmentInput, setDepartmentInput] = useState("");
	const [roleInput, setRoleInput] = useState("");
	const [busy, setBusy] = useState(false);
	const [loading, setLoading] = useState(true);
	const dirty = useRef(false);

	useEffect(() => {
		let active = true;
		fetchOrganization(token).then((result) => {
			if (!active) return;
			// A quick admin may have edited the locally-seeded labels while the
			// API was loading — never clobber those edits on arrival.
			if (!dirty.current) {
				setDepartments(result.departments || []);
				setRoles(result.roles || []);
			}
			setLoading(false);
		});
		return () => { active = false; };
	}, [token]);

	const add = (setter) => (value, clear) => {
		const label = value.trim().slice(0, 60);
		if (!label) return;
		dirty.current = true;
		setter((items) => items.includes(label) ? items : [...items, label]);
		clear("");
	};

	const remove = (setter) => (item) => {
		dirty.current = true;
		setter((items) => items.filter((value) => value !== item));
	};

	const save = async () => {
		setBusy(true);
		try {
			const result = await saveOrganization(token, { departments, roles });
			if (result.success) {
				setDepartments(result.departments || departments);
				setRoles(result.roles || roles);
				toast.success(result.message);
			} else toast.error(result.message);
		} finally {
			setBusy(false);
		}
	};

	return (
		<div data-testid="hr-organization" className="space-y-5">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Roles &amp; departments</h2>
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage the labels used across the employee directory and management forms.</p>
				</div>
				<button
					type="button"
					data-testid="hr-org-save"
					onClick={save}
					disabled={busy || loading}
					className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg disabled:opacity-60 dark:bg-white dark:text-gray-900"
				>
					{loading ? "Loading…" : "Save changes"}
				</button>
			</div>

			<div className="grid gap-5 lg:grid-cols-2">
				<LabelList
					title="Departments"
					testId="hr-org-departments"
					addTestId="hr-org-add-department"
					items={departments}
					value={departmentInput}
					onValue={setDepartmentInput}
					onAdd={() => add(setDepartments)(departmentInput, setDepartmentInput)}
					onRemove={remove(setDepartments)}
				/>
				<LabelList
					title="Role labels"
					testId="hr-org-roles"
					addTestId="hr-org-add-role"
					items={roles}
					value={roleInput}
					onValue={setRoleInput}
					onAdd={() => add(setRoles)(roleInput, setRoleInput)}
					onRemove={remove(setRoles)}
				/>
			</div>
		</div>
	);
};

export default HrOrganization;
