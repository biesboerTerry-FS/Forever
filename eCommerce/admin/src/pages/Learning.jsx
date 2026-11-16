import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import { downloadCsv, downloadPdf } from "../utils/export";

const empty = { employeeId: "", employeeName: "", course: "", module: "", status: "Assigned", progress: 0, dueDate: "", score: "", notes: "" };

const Learning = ({ token }) => {
	const [items, setItems] = useState([]);
	const [employees, setEmployees] = useState([]);
	const [form, setForm] = useState(empty);
	const [editingId, setEditingId] = useState(null);

	const load = async () => {
		try {
			const [l, e] = await Promise.all([
				axios.get(backendUrl + "/api/hr/learning", { headers: { token } }),
				axios.get(backendUrl + "/api/hr/employees", { headers: { token } }),
			]);
			if (l.data.success) setItems(l.data.learning || []);
			if (e.data.success) setEmployees(e.data.employees || []);
		} catch (err) { toast.error(err.message); }
	};
	useEffect(() => { if (token) load(); }, [token]); // eslint-disable-line

	const save = async (e) => {
		e.preventDefault();
		try {
			const emp = employees.find((x) => x._id === form.employeeId);
			const payload = { ...form, employeeName: emp?.name || form.employeeName, progress: Number(form.progress || 0), score: form.score === "" ? null : Number(form.score) };
			if (editingId) payload.id = editingId;
			const res = await axios.post(backendUrl + "/api/hr/learning/upsert", payload, { headers: { token } });
			if (res.data.success) { toast.success(res.data.message); setForm(empty); setEditingId(null); load(); } else toast.error(res.data.message);
		} catch (err) { toast.error(err.message); }
	};
	const edit = (it) => { setEditingId(it._id); setForm({ employeeId: it.employeeId||"", employeeName: it.employeeName||"", course: it.course||"", module: it.module||"", status: it.status||"Assigned", progress: it.progress ?? 0, dueDate: it.dueDate||"", score: it.score ?? "", notes: it.notes||"" }); };
	const remove = async (id) => { if(!window.confirm("Remove this learning record?")) return; try { const res = await axios.post(backendUrl + "/api/hr/learning/remove", { id }, { headers: { token } }); if(res.data.success){toast.success(res.data.message); load();} else toast.error(res.data.message);} catch(e){toast.error(e.message);} };
	const rows = items.map((i)=>[i.employeeName,i.course,i.module||"",i.status,i.progress+"%",""+(i.score??""),i.dueDate||"",i.completedDate||""]);

	return (
		<div>
			<div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Learning System (Demo)</h3>
					<p className="text-xs text-gray-500 dark:text-gray-400">Track training courses, modules, progress, and completion for staff.</p>
				</div>
				<div className="flex gap-2">
					<button onClick={()=>downloadCsv("learning.csv",[["Employee","Course","Module","Status","Progress","Score","Due","Completed"],...rows])} className="px-3 py-2 text-sm border rounded-lg dark:border-gray-700">Export CSV</button>
					<button onClick={()=>downloadPdf("Learning (Demo)",["Employee","Course","Module","Status","Progress","Score","Due","Completed"],rows)} className="px-3 py-2 text-sm border rounded-lg dark:border-gray-700">Export PDF</button>
				</div>
			</div>
			<form onSubmit={save} className="grid gap-3 p-4 mb-4 bg-white rounded-2xl shadow-sm md:grid-cols-4 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
				<select required value={form.employeeId} onChange={(e)=>setForm({...form,employeeId:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700 md:col-span-2"><option value="">Select employee</option>{employees.map((emp)=><option key={emp._id} value={emp._id}>{emp.name}</option>)}</select>
				<input required placeholder="Course" value={form.course} onChange={(e)=>setForm({...form,course:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input placeholder="Module" value={form.module} onChange={(e)=>setForm({...form,module:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700"><option>Assigned</option><option>In Progress</option><option>Completed</option></select>
				<input type="number" min="0" max="100" placeholder="Progress %" value={form.progress} onChange={(e)=>setForm({...form,progress:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input type="number" min="0" max="100" placeholder="Score (optional)" value={form.score} onChange={(e)=>setForm({...form,score:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input type="date" value={form.dueDate} onChange={(e)=>setForm({...form,dueDate:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input placeholder="Notes" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} className="px-3 py-2 text-sm border rounded md:col-span-4 dark:bg-gray-950 dark:border-gray-700" />
				<div className="flex gap-2 md:col-span-4"><button className="px-4 py-2 text-sm text-white bg-black rounded dark:bg-white dark:text-gray-900">{editingId?"Update":"Assign"} Learning</button>{editingId && <button type="button" onClick={()=>{setEditingId(null);setForm(empty);}} className="px-4 py-2 text-sm border rounded dark:border-gray-700">Cancel</button>}</div>
			</form>
			<div className="overflow-x-auto bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
				<table className="w-full text-sm"><thead className="text-xs text-left text-gray-500 uppercase dark:text-gray-400"><tr><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Course</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Progress</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Completed</th><th className="px-4 py-3">Actions</th></tr></thead>
				<tbody>{items.map((i)=>(<tr key={i._id} className="border-t dark:border-gray-800"><td className="px-4 py-3">{i.employeeName}</td><td className="px-4 py-3"><div className="font-medium">{i.course}</div><div className="text-xs text-gray-500">{i.module}</div></td><td className="px-4 py-3">{i.status}</td><td className="px-4 py-3">{i.progress}%</td><td className="px-4 py-3">{i.dueDate||"—"}</td><td className="px-4 py-3">{i.completedDate||"—"}</td><td className="px-4 py-3"><div className="flex gap-3"><button onClick={()=>edit(i)} className="text-blue-600 dark:text-blue-400">Edit</button><button onClick={()=>remove(i._id)} className="text-red-500">Remove</button></div></td></tr>))}{items.length===0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No learning records yet.</td></tr>}</tbody></table>
			</div>
		</div>
	);
};

export default Learning;
