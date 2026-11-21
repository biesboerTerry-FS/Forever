import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { fetchTimeOff, formatDate, setTimeOffStatus } from "../../utils/hr";

const FILTERS = ["All", "Pending", "Approved", "Declined"];

const HrTimeOff = ({ token }) => {
	const [requests, setRequests] = useState([]);
	const [filter, setFilter] = useState("Pending");
	const [busyId, setBusyId] = useState(null);

	const load = async () => {
		const result = await fetchTimeOff(token);
		setRequests(result.requests || []);
	};

	useEffect(() => { load(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

	const shown = useMemo(
		() => (filter === "All" ? requests : requests.filter((item) => item.status === filter)),
		[requests, filter]
	);

	const decide = async (request, status) => {
		setBusyId(request._id);
		try {
			const result = await setTimeOffStatus(token, request._id, status);
			if (result.success) {
				toast.success(result.message);
				setRequests((items) => items.map((item) =>
					String(item._id) === String(request._id) ? { ...item, status } : item
				));
			} else toast.error(result.message);
		} finally {
			setBusyId(null);
		}
	};

	const pending = requests.filter((item) => item.status === "Pending").length;
	return (
		<div data-testid="hr-timeoff" className="space-y-5">
			<div>
				<h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Time-off approvals</h2>
				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
					Review requests submitted in the employee portal. Decisions are written back to the shared queue.
				</p>
			</div>

			<div className="p-4 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
				<p className="text-sm text-gray-500 dark:text-gray-400">
					<span className="font-semibold text-gray-800 dark:text-gray-100">{pending}</span> pending request{pending === 1 ? "" : "s"} in the queue.
				</p>
			</div>

			<div className="flex flex-wrap gap-2">
				{FILTERS.map((item) => (
					<button
						key={item}
						type="button"
						data-testid={`hr-timeoff-filter-${item.toLowerCase()}`}
						onClick={() => setFilter(item)}
						className={`px-3 py-2 text-sm rounded-lg border ${filter === item ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white" : "border-gray-200 dark:border-gray-700"}`}
					>
						{item}
					</button>
				))}
			</div>

			<div className="overflow-x-auto bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
				<table data-testid="hr-timeoff-table" className="w-full text-sm">
					<thead className="text-xs text-left text-gray-500 uppercase dark:text-gray-400">
						<tr><th className="px-4 py-3">Type</th><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
					</thead>
					<tbody>
						{shown.map((request) => (
							<tr data-testid="hr-timeoff-row" key={request._id} className="border-t dark:border-gray-800">
								<td className="px-4 py-3 capitalize">{request.type === "timeoff" ? "Time off" : "Shift swap"}</td>
								<td className="px-4 py-3 font-medium">{request.employeeName}</td>
								<td className="px-4 py-3 whitespace-nowrap">
									{formatDate(request.date)}{request.endDate && request.endDate !== request.date ? ` – ${formatDate(request.endDate)}` : ""}
								</td>
								<td className="px-4 py-3">{request.reason || "—"}</td>
								<td data-testid="hr-timeoff-status" className="px-4 py-3">{request.status}</td>
								<td className="px-4 py-3">
									{request.status === "Pending" ? (
										<div className="flex gap-3">
											<button type="button" data-testid="hr-timeoff-approve" disabled={busyId === request._id} onClick={() => decide(request, "Approved")} className="text-green-600 dark:text-green-400">Approve</button>
											<button type="button" data-testid="hr-timeoff-deny" disabled={busyId === request._id} onClick={() => decide(request, "Declined")} className="text-red-500">Deny</button>
										</div>
									) : (
										<span className="text-gray-400">Reviewed</span>
									)}
								</td>
							</tr>
						))}
						{shown.length === 0 && <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No {filter.toLowerCase()} requests.</td></tr>}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default HrTimeOff;
