import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl, currency } from "../App";
import { downloadCsv, downloadPdf } from "../utils/export";

const empty = { employeeId: "", employeeName: "", periodStart: "", periodEnd: "", hours: "", hourlyRate: "", bonus: "0", deductions: "0", status: "Draft", notes: "" };

const Payroll = ({ token }) => {
	const [items, setItems] = useState([]);
	const [employees, setEmployees] = useState([]);
	const [form, setForm] = useState(empty);
	const [editingId, setEditingId] = useState(null);
	const [showForm, setShowForm] = useState(false);

	const load = async () => {
		try {
			const [p, e] = await Promise.all([
				axios.get(backendUrl + "/api/hr/payroll", { headers: { token } }),
				axios.get(backendUrl + "/api/hr/employees", { headers: { token } }),
			]);
			if (p.data.success) setItems(p.data.payroll || []);
			if (e.data.success) setEmployees(e.data.employees || []);
		} catch (err) { toast.error(err.message); }
	};
	useEffect(() => { if (token) load(); }, [token]); // eslint-disable-line

	const onEmp = (id) => {
		const emp = employees.find((x)=>x._id===id);
		setForm((f)=>({ ...f, employeeId: id, employeeName: emp?.name||"", hourlyRate: emp?.hourlyRate ?? f.hourlyRate }));
	};

	const preview = useMemo(() => {
		const h=Number(form.hours||0), r=Number(form.hourlyRate||0), b=Number(form.bonus||0), d=Number(form.deductions||0);
		const gross=h*r+b, net=gross-d; return {gross, net};
	}, [form]);

	const save = async (e) => {
		e.preventDefault();
		try {
			const emp = employees.find((x) => x._id === form.employeeId);
			const payload = { ...form, employeeName: emp?.name || form.employeeName, hours: Number(form.hours||0), hourlyRate: Number(form.hourlyRate||0), bonus: Number(form.bonus||0), deductions: Number(form.deductions||0) };
			if (editingId) payload.id = editingId;
			const res = await axios.post(backendUrl + "/api/hr/payroll/upsert", payload, { headers: { token } });
			if (res.data.success) { toast.success(res.data.message); setForm(empty); setEditingId(null); setShowForm(false); load(); } else toast.error(res.data.message);
		} catch (err) { toast.error(err.message); }
	};
	const edit = (it) => { setEditingId(it._id); setShowForm(true); setForm({ employeeId: it.employeeId||"", employeeName: it.employeeName||"", periodStart: it.periodStart||"", periodEnd: it.periodEnd||"", hours: it.hours ?? "", hourlyRate: it.hourlyRate ?? "", bonus: it.bonus ?? 0, deductions: it.deductions ?? 0, status: it.status||"Draft", notes: it.notes||"" }); };
	const startAdd = () => { setEditingId(null); setForm(empty); setShowForm(true); };
	const cancelForm = () => { setEditingId(null); setForm(empty); setShowForm(false); };
	const remove = async (id) => { if(!window.confirm("Remove this payroll record?")) return; try { const res = await axios.post(backendUrl + "/api/hr/payroll/remove", { id }, { headers: { token } }); if(res.data.success){toast.success(res.data.message); load();} else toast.error(res.data.message);} catch(e){toast.error(e.message);} };
	const rows = items.map((p)=>[p.employeeName,`${p.periodStart} - ${p.periodEnd}`,p.hours,`${currency}${p.hourlyRate}`,`${currency}${p.grossPay}`,`${currency}${p.netPay}`,p.status]);

	return (
		<div>
			<div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-end sm:justify-between">
				<h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Payroll</h3>
				<div className="flex flex-wrap gap-2">
					<button onClick={()=>downloadCsv("payroll.csv",[["Employee","Period","Hours","Rate","Gross","Net","Status"],...rows])} className="px-3 py-2 text-sm border rounded-lg dark:border-gray-700">Export CSV</button>
					<button onClick={()=>downloadPdf("Payroll",["Employee","Period","Hours","Rate","Gross","Net","Status"],rows)} className="px-3 py-2 text-sm border rounded-lg dark:border-gray-700">Export PDF</button>
					<button onClick={startAdd} className="px-3 py-2 text-sm text-white bg-black rounded-lg dark:bg-white dark:text-gray-900">Add Payroll</button>
				</div>
			</div>
			{showForm && <form onSubmit={save} className="grid gap-3 p-4 mb-4 bg-white rounded-2xl shadow-sm md:grid-cols-4 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
				<select required value={form.employeeId} onChange={(e)=>onEmp(e.target.value)} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700 md:col-span-2"><option value="">Select employee</option>{employees.map((emp)=><option key={emp._id} value={emp._id}>{emp.name}</option>)}</select>
				<select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700"><option>Draft</option><option>Approved</option><option>Paid</option></select>
				<div className="px-3 py-2 text-sm border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700">Preview Net: <span className="font-semibold">{currency}{preview.net.toFixed(2)}</span></div>
				<input required type="date" value={form.periodStart} onChange={(e)=>setForm({...form,periodStart:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input required type="date" value={form.periodEnd} onChange={(e)=>setForm({...form,periodEnd:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input type="number" step="0.01" placeholder="Hours" value={form.hours} onChange={(e)=>setForm({...form,hours:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input type="number" step="0.01" placeholder="Hourly rate" value={form.hourlyRate} onChange={(e)=>setForm({...form,hourlyRate:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input type="number" step="0.01" placeholder="Bonus" value={form.bonus} onChange={(e)=>setForm({...form,bonus:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input type="number" step="0.01" placeholder="Deductions" value={form.deductions} onChange={(e)=>setForm({...form,deductions:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input placeholder="Notes" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} className="px-3 py-2 text-sm border rounded md:col-span-2 dark:bg-gray-950 dark:border-gray-700" />
				<div className="flex gap-2 md:col-span-4"><button className="px-4 py-2 text-sm text-white bg-black rounded dark:bg-white dark:text-gray-900">{editingId?"Update":"Add"} Payroll</button><button type="button" onClick={cancelForm} className="px-4 py-2 text-sm border rounded dark:border-gray-700">Cancel</button></div>
			</form>}
			<div className="overflow-x-auto bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
				<table className="w-full text-sm"><thead className="text-xs text-left text-gray-500 uppercase dark:text-gray-400"><tr><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Period</th><th className="px-4 py-3">Hours</th><th className="px-4 py-3">Gross</th><th className="px-4 py-3">Net</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
				<tbody>{items.map((p)=>(<tr key={p._id} className="border-t dark:border-gray-800"><td className="px-4 py-3">{p.employeeName}</td><td className="px-4 py-3">{p.periodStart} – {p.periodEnd}</td><td className="px-4 py-3">{p.hours}</td><td className="px-4 py-3">{currency}{p.grossPay}</td><td className="px-4 py-3 font-medium">{currency}{p.netPay}</td><td className="px-4 py-3">{p.status}</td><td className="px-4 py-3"><div className="flex gap-3"><button onClick={()=>edit(p)} className="text-blue-600 dark:text-blue-400">Edit</button><button onClick={()=>remove(p._id)} className="text-red-500">Remove</button></div></td></tr>))}{items.length===0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No payroll records yet.</td></tr>}</tbody></table>
			</div>
		</div>
	);
};

export default Payroll;
