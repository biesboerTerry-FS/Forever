import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl, currency } from "../App";
import { downloadCsv, downloadPdf } from "../utils/export";

const Card = ({ label, value, hint }) => (
	<div className="p-4 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
		<p className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">{label}</p>
		<p className="mt-2 text-xl font-semibold text-gray-800 dark:text-gray-100">{value}</p>
		{hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
	</div>
);

const Reports = ({ token }) => {
	const [data, setData] = useState(null);
	const load = async () => {
		try {
			const res = await axios.get(backendUrl + "/api/hr/reports", { headers: { token } });
			if (res.data.success) setData(res.data.reports); else toast.error(res.data.message);
		} catch (e) { toast.error(e.message); }
	};
	useEffect(() => { if (token) load(); }, [token]); // eslint-disable-line

	if (!data) return <p className="text-gray-500">Loading reports…</p>;
	const s = data.summary || {};

	const exportSummaryCsv = () => downloadCsv("reports-summary.csv", [
		["Metric","Value"],
		["Revenue", s.revenue], ["Paid revenue", s.paidRevenue], ["Orders", s.orders], ["Products", s.products],
		["Employees", s.employees], ["Managers", s.managers], ["Scheduled shifts", s.scheduledShifts],
		["Payroll gross", data.payrollTotals?.gross], ["Payroll net", data.payrollTotals?.net], ["Payroll hours", data.payrollTotals?.hours],
		["Learning total", data.learningStats?.total], ["Learning completed", data.learningStats?.completed],
	]);
	const exportSummaryPdf = () => downloadPdf("Reports Summary", ["Metric","Value"], [
		["Revenue", `${currency}${s.revenue}`], ["Paid revenue", `${currency}${s.paidRevenue}`], ["Orders", s.orders], ["Products", s.products],
		["Employees", s.employees], ["Managers", s.managers], ["Scheduled shifts", s.scheduledShifts],
		["Payroll gross", `${currency}${data.payrollTotals?.gross}`], ["Payroll net", `${currency}${data.payrollTotals?.net}`], ["Payroll hours", data.payrollTotals?.hours],
		["Learning completed", `${data.learningStats?.completed}/${data.learningStats?.total}`],
	]);

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
				<h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Reports</h3>
				<div className="flex gap-2">
					<button onClick={exportSummaryCsv} className="px-3 py-2 text-sm border rounded-lg dark:border-gray-700">Export CSV</button>
					<button onClick={exportSummaryPdf} className="px-3 py-2 text-sm border rounded-lg dark:border-gray-700">Export PDF</button>
					<button onClick={load} className="px-3 py-2 text-sm border rounded-lg dark:border-gray-700">Refresh</button>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
				<Card label="Revenue" value={`${currency}${Number(s.revenue||0).toFixed(2)}`} hint={`${currency}${Number(s.paidRevenue||0).toFixed(2)} paid`} />
				<Card label="Orders" value={s.orders} hint={`${s.products} products`} />
				<Card label="Staff" value={s.employees} hint={`${s.managers} managers · ${s.scheduledShifts} shifts`} />
				<Card label="Payroll (net)" value={`${currency}${Number(data.payrollTotals?.net||0).toFixed(2)}`} hint={`${Number(data.payrollTotals?.hours||0)} hours total`} />
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<div className="p-4 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
					<h4 className="mb-3 font-medium text-gray-800 dark:text-gray-100">Orders by status</h4>
					<div className="space-y-2 text-sm">
						{Object.entries(data.ordersByStatus || {}).map(([k,v]) => (
							<div key={k} className="flex justify-between"><span>{k}</span><span className="font-medium">{v}</span></div>
						))}
						{Object.keys(data.ordersByStatus || {}).length === 0 && <p className="text-gray-500">No order data.</p>}
					</div>
				</div>
				<div className="p-4 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
					<h4 className="mb-3 font-medium text-gray-800 dark:text-gray-100">Learning & catalog</h4>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between"><span>Learning completed</span><span className="font-medium">{data.learningStats?.completed}/{data.learningStats?.total}</span></div>
						<div className="flex justify-between"><span>In progress</span><span className="font-medium">{data.learningStats?.inProgress}</span></div>
						<div className="flex justify-between"><span>Assigned</span><span className="font-medium">{data.learningStats?.assigned}</span></div>
						<div className="pt-2 mt-2 border-t dark:border-gray-800">
							{Object.entries(data.categoryCounts || {}).map(([k,v]) => (
								<div key={k} className="flex justify-between"><span>{k} products</span><span className="font-medium">{v}</span></div>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className="p-4 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
				<h4 className="mb-3 font-medium text-gray-800 dark:text-gray-100">Recent orders</h4>
				<div className="overflow-x-auto">
					<table className="w-full text-sm"><thead className="text-xs text-left text-gray-500 uppercase dark:text-gray-400"><tr><th className="py-2 pr-3">Date</th><th className="py-2 pr-3">Customer</th><th className="py-2 pr-3">Amount</th><th className="py-2 pr-3">Status</th><th className="py-2">Payment</th></tr></thead>
					<tbody>{(data.recentOrders||[]).map((o)=>(<tr key={o._id} className="border-t dark:border-gray-800"><td className="py-2 pr-3">{o.date?new Date(o.date).toLocaleDateString():""}</td><td className="py-2 pr-3">{o.customer||"—"}</td><td className="py-2 pr-3">{currency}{o.amount}</td><td className="py-2 pr-3">{o.status}</td><td className="py-2">{o.payment?"Paid":"Pending"}</td></tr>))}</tbody></table>
				</div>
			</div>
		</div>
	);
};

export default Reports;
