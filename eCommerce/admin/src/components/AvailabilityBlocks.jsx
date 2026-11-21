import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";

// Read-only owner/admin view of the date + time ranges employees marked as
// unavailable in their self-service portal.
const AvailabilityBlocks = ({ token }) => {
	const [blocks, setBlocks] = useState([]);

	useEffect(() => {
		let active = true;
		const load = async () => {
			if (!token || !backendUrl) return;
			try {
				const response = await axios.get(`${backendUrl}/api/employee/blocks/all`, {
					headers: { token },
				});
				if (response.data?.success && Array.isArray(response.data.blocks) && active) {
					setBlocks(response.data.blocks);
				}
			} catch {
				// keep the empty state; blocks are a scheduling aid, not critical
			}
		};
		load();
		return () => {
			active = false;
		};
	}, [token]);

	const formatDate = (value) => {
		const date = new Date(`${value}T00:00:00`);
		if (Number.isNaN(date.getTime())) return value;
		return date.toLocaleDateString(undefined, {
			weekday: "short",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div data-testid="admin-availability-blocks" className="mt-8 rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
			<h4 className="mb-1 text-base font-medium text-gray-800 dark:text-gray-100">
				Unavailable dates &amp; times
			</h4>
			<p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
				Submitted by employees in their portal. Avoid scheduling them during these blocks.
			</p>
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead className="text-xs text-left uppercase text-gray-500 dark:text-gray-400">
						<tr>
							<th className="px-4 py-3">Employee</th>
							<th className="px-4 py-3">Date</th>
							<th className="px-4 py-3">Time</th>
							<th className="px-4 py-3">Reason</th>
						</tr>
					</thead>
					<tbody>
						{blocks.map((block) => (
							<tr key={String(block._id || block.id)} data-testid="availability-block-row" className="border-t dark:border-gray-800">
								<td className="px-4 py-3 font-medium">{block.employeeName || "Employee"}</td>
								<td className="px-4 py-3 whitespace-nowrap">{formatDate(block.date)}</td>
								<td className="px-4 py-3 whitespace-nowrap">{block.startTime}–{block.endTime}</td>
								<td className="px-4 py-3">{block.reason || "—"}</td>
							</tr>
						))}
						{blocks.length === 0 && (
							<tr>
								<td colSpan="4" className="px-4 py-8 text-center text-gray-500">
									No unavailable time blocks reported.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default AvailabilityBlocks;
