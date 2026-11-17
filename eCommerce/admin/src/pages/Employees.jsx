import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import { downloadCsv, downloadPdf } from "../utils/export";

const empty = { name: "", email: "", role: "Staff", department: "Retail", status: "Active", phone: "", hourlyRate: "", notes: "" };

const Employees = ({ token, managerOnly = false }) => {
	const [items, setItems] = useState([]);
	const [form, setForm] = useState(empty);
	const [editingId, setEditingId] = useState(null);
	const [showForm, setShowForm] = useState(false);

	const load = async () => {
		try {
			const res = await axios.get(backendUrl + "/api/hr/employees", { headers: { token } });
			if (res.data.success) setItems(res.data.employees || []);
			else toast.error(res.data.message);
		} catch (e) { toast.error(e.message); }
	};

	useEffect(() => { if (token) load(); }, [token]); // eslint-disable-line

	const shown = items.filter((e) => managerOnly ? /manager/i.test(e.role || "") : true);

	const save = async (e) => {
		e.preventDefault();
		try {
			const payload = { ...form, hourlyRate: Number(form.hourlyRate || 0) };
			if (editingId) payload.id = editingId;
			if (managerOnly && !/manager/i.test(payload.role)) payload.role = "Store Manager";
			const res = await axios.post(backendUrl + "/api/hr/employees/upsert", payload, { headers: { token } });
			if (res.data.success) { toast.success(res.data.message); setForm(empty); setEditingId(null); setShowForm(false); load(); }
			else toast.error(res.data.message);
		} catch (err) { toast.error(err.message); }
	};

	const edit = (emp) => {
		setEditingId(emp._id);
		setShowForm(true);
		setForm({ name: emp.name||"", email: emp.email||"", role: emp.role||"Staff", department: emp.department||"Retail", status: emp.status||"Active", phone: emp.phone||"", hourlyRate: emp.hourlyRate ?? "", notes: emp.notes||"" });
	};

	const startAdd = () => {
		setEditingId(null);
		setForm(empty);
		setShowForm(true);
	};

	const cancelForm = () => {
		setEditingId(null);
		setForm(empty);
		setShowForm(false);
	};

	const remove = async (id) => {
		if (!window.confirm("Remove this employee?")) return;
		try {
			const res = await axios.post(backendUrl + "/api/hr/employees/remove", { id }, { headers: { token } });
			if (res.data.success) { toast.success(res.data.message); load(); } else toast.error(res.data.message);
		} catch (e) { toast.error(e.message); }
	};

	const exportRows = () => shown.map((e) => [e.name, e.email, e.role, e.department, e.status, e.phone, e.hourlyRate ?? ""]);

	return (
		<div>
			<div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-end sm:justify-between">
				<h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">{managerOnly ? "Managers" : "Employees"}</h3>
				<div className="flex flex-wrap gap-2">
					<button onClick={() => downloadCsv(`${managerOnly?"managers":"employees"}.csv`, [["Name","Email","Role","Department","Status","Phone","Hourly Rate"], ...exportRows()])} className="px-3 py-2 text-sm border rounded-lg dark:border-gray-700">Export CSV</button>
					<button onClick={() => downloadPdf(managerOnly?"Managers":"Employees", ["Name","Email","Role","Department","Status","Phone","Rate"], exportRows())} className="px-3 py-2 text-sm border rounded-lg dark:border-gray-700">Export PDF</button>
					<button onClick={startAdd} className="px-3 py-2 text-sm text-white bg-black rounded-lg dark:bg-white dark:text-gray-900">{managerOnly ? "Add Manager" : "Add Employee"}</button>
				</div>
			</div>

			{showForm && <form onSubmit={save} className="grid gap-3 p-4 mb-4 bg-white rounded-2xl shadow-sm md:grid-cols-3 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
				<input required placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input required type="email" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input placeholder={managerOnly ? "Manager role (e.g. Store Manager)" : "Role"} value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input placeholder="Department" value={form.department} onChange={(e)=>setForm({...form,department:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700">
					<option>Active</option><option>On Leave</option><option>Inactive</option>
				</select>
				<input placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input type="number" step="0.01" placeholder="Hourly rate" value={form.hourlyRate} onChange={(e)=>setForm({...form,hourlyRate:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input placeholder="Notes" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} className="px-3 py-2 text-sm border rounded md:col-span-2 dark:bg-gray-950 dark:border-gray-700" />
				<div className="flex gap-2 md:col-span-3">
					<button className="px-4 py-2 text-sm text-white bg-black rounded dark:bg-white dark:text-gray-900">{editingId ? "Update" : "Add"} {managerOnly ? "Manager" : "Employee"}</button>
					<button type="button" onClick={cancelForm} className="px-4 py-2 text-sm border rounded dark:border-gray-700">Cancel</button>
				</div>
			</form>}

			<div className="overflow-x-auto bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
				<table className="w-full text-sm">
					<thead className="text-xs text-left text-gray-500 uppercase dark:text-gray-400"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Dept</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Rate</th><th className="px-4 py-3">Actions</th></tr></thead>
					<tbody>
						{shown.map((emp) => (
							<tr key={emp._id} className="border-t dark:border-gray-800">
								<td className="px-4 py-3 font-medium">{emp.name}</td><td className="px-4 py-3">{emp.email}</td><td className="px-4 py-3">{emp.role}</td><td className="px-4 py-3">{emp.department}</td><td className="px-4 py-3">{emp.status}</td><td className="px-4 py-3">${emp.hourlyRate ?? 0}/hr</td>
								<td className="px-4 py-3"><div className="flex gap-3"><button onClick={()=>edit(emp)} className="text-blue-600 dark:text-blue-400">Edit</button><button onClick={()=>remove(emp._id)} className="text-red-500">Remove</button></div></td>
							</tr>
						))}
						{shown.length === 0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No {managerOnly?"managers":"employees"} found.</td></tr>}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default Employees;
