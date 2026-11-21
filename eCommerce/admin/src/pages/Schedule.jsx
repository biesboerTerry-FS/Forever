import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import { downloadCsv, downloadPdf } from "../utils/export";
import {
	loadScheduleRequests,
	saveScheduleRequests,
	formatDate,
} from "../utils/ops";

const empty = { employeeId: "", employeeName: "", date: "", startTime: "09:00", endTime: "17:00", role: "", location: "Store", notes: "", status: "Scheduled" };

const Schedule = ({ token }) => {
	const [items, setItems] = useState([]);
	const [employees, setEmployees] = useState([]);
	const [form, setForm] = useState(empty);
	const [editingId, setEditingId] = useState(null);
	const [showForm, setShowForm] = useState(false);
	const [requests, setRequests] = useState(loadScheduleRequests);

	const load = async () => {
		try {
			const [s, e] = await Promise.all([
				axios.get(backendUrl + "/api/hr/schedules", { headers: { token } }),
				axios.get(backendUrl + "/api/hr/employees", { headers: { token } }),
			]);
			if (s.data.success) setItems(s.data.schedules || []);
			if (e.data.success) setEmployees(e.data.employees || []);
		} catch (err) { toast.error(err.message); }
	};

	const loadRequests = async () => {
		if (!token || !backendUrl) return;
		try {
			const response = await axios.get(backendUrl + "/api/hr/requests", { headers: { token } });
			if (response.data?.success && Array.isArray(response.data.requests)) {
				setRequests(response.data.requests);
				saveScheduleRequests(response.data.requests);
			}
		} catch {
			// Keep the local/demo requests when the API is unavailable.
		}
	};

	useEffect(() => { if (token) { load(); loadRequests(); } }, [token]); // eslint-disable-line

	const setRequestStatus = async (id, status) => {
		const key = (item) => String(item._id || item.id);
		const next = requests.map((item) =>
			key(item) === String(id) ? { ...item, status } : item
		);
		setRequests(next);
		saveScheduleRequests(next);
		if (token && backendUrl && !String(id).startsWith("demo-")) {
			try {
				await axios.patch(`${backendUrl}/api/hr/requests/${id}`, { status }, { headers: { token } });
			} catch {
				// local status still persists
			}
		}
		toast.success(`Request ${status.toLowerCase()}.`);
	};

	const save = async (e) => {
		e.preventDefault();
		try {
			const emp = employees.find((x) => x._id === form.employeeId);
			const payload = { ...form, employeeName: emp?.name || form.employeeName };
			if (editingId) payload.id = editingId;
			const res = await axios.post(backendUrl + "/api/hr/schedules/upsert", payload, { headers: { token } });
			if (res.data.success) { toast.success(res.data.message); setForm(empty); setEditingId(null); setShowForm(false); load(); } else toast.error(res.data.message);
		} catch (err) { toast.error(err.message); }
	};

	const edit = (s) => { setEditingId(s._id); setShowForm(true); setForm({ employeeId: s.employeeId||"", employeeName: s.employeeName||"", date: s.date||"", startTime: s.startTime||"09:00", endTime: s.endTime||"17:00", role: s.role||"", location: s.location||"Store", notes: s.notes||"", status: s.status||"Scheduled" }); };

	const startAdd = () => { setEditingId(null); setForm(empty); setShowForm(true); };
	const cancelForm = () => { setEditingId(null); setForm(empty); setShowForm(false); };
	const remove = async (id) => { if(!window.confirm("Remove this shift?")) return; try { const res = await axios.post(backendUrl + "/api/hr/schedules/remove", { id }, { headers: { token } }); if(res.data.success){toast.success(res.data.message); load();} else toast.error(res.data.message);} catch(e){toast.error(e.message);} };
	const rows = items.map((s)=>[s.date,s.employeeName,s.startTime,s.endTime,s.role||"",s.location||"",s.status||""]);

	return (
		<div>
			<div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-end sm:justify-between">
				<h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Schedule</h3>
				<div className="flex flex-wrap gap-2">
					<button onClick={()=>downloadCsv("schedule.csv",[["Date","Employee","Start","End","Role","Location","Status"],...rows])} className="px-3 py-2 text-sm border rounded-lg dark:border-gray-700">Export CSV</button>
					<button onClick={()=>downloadPdf("Schedule",["Date","Employee","Start","End","Role","Location","Status"],rows)} className="px-3 py-2 text-sm border rounded-lg dark:border-gray-700">Export PDF</button>
					<button onClick={startAdd} className="px-3 py-2 text-sm text-white bg-black rounded-lg dark:bg-white dark:text-gray-900">Add Shift</button>
				</div>
			</div>
			{showForm && <form onSubmit={save} className="grid gap-3 p-4 mb-4 bg-white rounded-2xl shadow-sm md:grid-cols-4 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
				<select required value={form.employeeId} onChange={(e)=>setForm({...form,employeeId:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700 md:col-span-2">
					<option value="">Select employee</option>
					{employees.map((emp)=><option key={emp._id} value={emp._id}>{emp.name} ({emp.role})</option>)}
				</select>
				<input required type="date" value={form.date} onChange={(e)=>setForm({...form,date:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700"><option>Scheduled</option><option>Completed</option><option>Cancelled</option></select>
				<input required type="time" value={form.startTime} onChange={(e)=>setForm({...form,startTime:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input required type="time" value={form.endTime} onChange={(e)=>setForm({...form,endTime:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input placeholder="Shift role" value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input placeholder="Location" value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})} className="px-3 py-2 text-sm border rounded dark:bg-gray-950 dark:border-gray-700" />
				<input placeholder="Notes" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} className="px-3 py-2 text-sm border rounded md:col-span-4 dark:bg-gray-950 dark:border-gray-700" />
				<div className="flex gap-2 md:col-span-4"><button className="px-4 py-2 text-sm text-white bg-black rounded dark:bg-white dark:text-gray-900">{editingId?"Update":"Add"} Shift</button><button type="button" onClick={cancelForm} className="px-4 py-2 text-sm border rounded dark:border-gray-700">Cancel</button></div>
			</form>}
			<div className="overflow-x-auto bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
				<table className="w-full text-sm"><thead className="text-xs text-left text-gray-500 uppercase dark:text-gray-400"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Time</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
				<tbody>{items.map((s)=>(<tr key={s._id} className="border-t dark:border-gray-800"><td className="px-4 py-3">{s.date}</td><td className="px-4 py-3">{s.employeeName}</td><td className="px-4 py-3">{s.startTime}-{s.endTime}</td><td className="px-4 py-3">{s.role}</td><td className="px-4 py-3">{s.location}</td><td className="px-4 py-3">{s.status}</td><td className="px-4 py-3"><div className="flex gap-3"><button onClick={()=>edit(s)} className="text-blue-600 dark:text-blue-400">Edit</button><button onClick={()=>remove(s._id)} className="text-red-500">Remove</button></div></td></tr>))}{items.length===0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No shifts scheduled.</td></tr>}</tbody></table>
			</div>

			<div data-testid="admin-schedule-requests" className="mt-8">
				<h4 className="mb-3 text-base font-medium text-gray-800 dark:text-gray-100">Schedule &amp; time-off requests</h4>
				<div className="overflow-x-auto bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
					<table className="w-full text-sm"><thead className="text-xs text-left text-gray-500 uppercase dark:text-gray-400"><tr><th className="px-4 py-3">Type</th><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
					<tbody>
						{requests.map((request) => {
							const id = String(request._id || request.id);
							return (
								<tr key={id} className="border-t dark:border-gray-800">
									<td className="px-4 py-3 capitalize">{request.type === "timeoff" ? "Time off" : "Shift swap"}</td>
									<td className="px-4 py-3">{request.employeeName}</td>
									<td className="px-4 py-3">{formatDate(request.date)}{request.endDate ? ` – ${formatDate(request.endDate)}` : ""}</td>
									<td className="px-4 py-3">{request.reason || "—"}</td>
									<td className="px-4 py-3"><span data-testid="request-status" className="font-medium">{request.status}</span></td>
									<td className="px-4 py-3">
										<div className="flex gap-3">
											<button type="button" onClick={() => setRequestStatus(id, "Approved")} className="text-green-600 dark:text-green-400">Approve</button>
											<button type="button" onClick={() => setRequestStatus(id, "Declined")} className="text-red-500">Decline</button>
										</div>
									</td>
								</tr>
							);
						})}
						{requests.length === 0 && <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No requests yet.</td></tr>}
					</tbody></table>
				</div>
			</div>

			<div data-testid="admin-availability" className="mt-8 p-5 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
				<h4 className="mb-3 text-base font-medium text-gray-800 dark:text-gray-100">Team availability</h4>
				<div className="flex flex-wrap gap-3">
					{employees.map((employee) => (
						<div key={employee._id} className="px-3 py-2 text-sm border rounded-lg dark:border-gray-700">
							<span className="font-medium">{employee.name}</span>
							<span className={employee.available === false ? "ml-2 text-red-500" : "ml-2 text-green-600 dark:text-green-400"}>
								{employee.available === false ? "Unavailable" : "Available"}
							</span>
						</div>
					))}
					{employees.length === 0 && <p className="text-sm text-gray-500">No employees on file.</p>}
				</div>
			</div>
		</div>
	);
};

export default Schedule;
