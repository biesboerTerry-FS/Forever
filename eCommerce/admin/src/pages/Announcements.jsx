import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
	BULLETIN_TYPES,
	BULLETINS_KEY,
	deleteBulletin,
	formatBulletinDate,
	loadBulletins,
	toggleBulletin,
	upsertBulletin,
} from "../utils/bulletins";

// Re-exported so other modules (e.g. the dashboard widget) can import the
// active-feed helper from the Announcements module itself.
export { getActiveBulletins } from "../utils/bulletins";

const EMPTY_FORM = { title: "", body: "", type: "info", active: true };

const TYPE_STYLES = {
	info: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
	warning: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
	promotion: "bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
};

const TypeBadge = ({ type }) => {
	const value = TYPE_STYLES[type] ? type : "info";
	return (
		<span
			className={`inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full capitalize ${TYPE_STYLES[value]}`}
		>
			{value}
		</span>
	);
};

const inputClass =
	"w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-950 dark:border-gray-700 dark:text-gray-100";

const Announcements = () => {
	const [bulletins, setBulletins] = useState([]);
	const [form, setForm] = useState(EMPTY_FORM);
	const [editingId, setEditingId] = useState(null);
	const [showForm, setShowForm] = useState(false);

	const refresh = () =>
		setBulletins(
			loadBulletins().slice().sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
		);

	useEffect(() => {
		refresh();
		const onStorage = (event) => {
			if (event.key === BULLETINS_KEY || event.key === null) refresh();
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, []);

	const startAdd = () => {
		setEditingId(null);
		setForm(EMPTY_FORM);
		setShowForm(true);
	};

	const startEdit = (bulletin) => {
		setEditingId(bulletin.id);
		setForm({
			title: bulletin.title || "",
			body: bulletin.body || "",
			type: bulletin.type || "info",
			active: Boolean(bulletin.active),
		});
		setShowForm(true);
	};

	const cancelForm = () => {
		setEditingId(null);
		setForm(EMPTY_FORM);
		setShowForm(false);
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		const title = form.title.trim();
		const body = form.body.trim();
		if (!title || !body) {
			toast.error("A title and message are required.");
			return;
		}
		const next = upsertBulletin({
			...(editingId ? { id: editingId } : {}),
			title,
			body,
			type: form.type,
			active: form.active,
		});
		setBulletins(next.slice().sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)));
		toast.success(editingId ? "Bulletin updated." : "Bulletin published.");
		cancelForm();
	};

	const handleToggle = (bulletin) => {
		const next = toggleBulletin(bulletin.id);
		setBulletins(next.slice().sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)));
		toast.success(bulletin.active ? "Bulletin deactivated." : "Bulletin activated.");
	};

	const handleDelete = (bulletin) => {
		if (!window.confirm(`Delete “${bulletin.title}”?`)) return;
		const next = deleteBulletin(bulletin.id);
		setBulletins(next.slice().sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)));
		toast.success("Bulletin deleted.");
	};

	return (
		<div>
			<div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
						Announcements
					</h3>
					<p className="text-xs text-gray-500 dark:text-gray-400">
						Post bulletins for the team. Saved in this browser only (demo mode —{" "}
						<code className="px-1 rounded bg-gray-100 dark:bg-gray-800">{BULLETINS_KEY}</code>
						).
					</p>
				</div>
				<button
					onClick={startAdd}
					className="self-start px-3 py-2 text-sm text-white bg-gray-900 rounded-lg hover:bg-gray-700 sm:self-auto dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
				>
					New bulletin
				</button>
			</div>

			{showForm && (
				<form
					onSubmit={handleSubmit}
					className="grid gap-3 p-4 mb-4 bg-white rounded-2xl shadow-sm md:grid-cols-2 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800"
				>
					<div className="md:col-span-2">
						<label htmlFor="bulletin-title" className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">
							Title
						</label>
						<input
							id="bulletin-title"
							autoFocus
							required
							placeholder="e.g. Holiday shipping schedule"
							value={form.title}
							onChange={(event) => setForm({ ...form, title: event.target.value })}
							className={inputClass}
						/>
					</div>
					<div className="md:col-span-2">
						<label htmlFor="bulletin-body" className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">
							Message
						</label>
						<textarea
							id="bulletin-body"
							required
							rows={3}
							placeholder="What should the team know?"
							value={form.body}
							onChange={(event) => setForm({ ...form, body: event.target.value })}
							className={inputClass}
						/>
					</div>
					<div>
						<label htmlFor="bulletin-type" className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">
							Type
						</label>
						<select
							id="bulletin-type"
							value={form.type}
							onChange={(event) => setForm({ ...form, type: event.target.value })}
							className={inputClass}
						>
							{BULLETIN_TYPES.map((type) => (
								<option key={type} value={type}>
									{type.charAt(0).toUpperCase() + type.slice(1)}
								</option>
							))}
						</select>
					</div>
					<div className="flex items-end">
						<label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
							<input
								type="checkbox"
								checked={form.active}
								onChange={(event) => setForm({ ...form, active: event.target.checked })}
								className="w-4 h-4 accent-gray-900 dark:accent-pink-500"
							/>
							Active (visible in the dashboard widget)
						</label>
					</div>
					<div className="flex gap-2 md:col-span-2">
						<button
							type="submit"
							className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg dark:bg-white dark:text-gray-900"
						>
							{editingId ? "Update bulletin" : "Publish bulletin"}
						</button>
						<button
							type="button"
							onClick={cancelForm}
							className="px-4 py-2 text-sm border rounded-lg dark:border-gray-700"
						>
							Cancel
						</button>
					</div>
				</form>
			)}

			<div className="overflow-x-auto bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
				<table className="w-full text-sm">
					<thead className="text-xs text-left text-gray-500 uppercase dark:text-gray-400">
						<tr>
							<th className="px-4 py-3">Bulletin</th>
							<th className="px-4 py-3">Type</th>
							<th className="px-4 py-3">Active</th>
							<th className="px-4 py-3">Date</th>
							<th className="px-4 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{bulletins.map((bulletin) => (
							<tr
								key={bulletin.id}
								className="border-t dark:border-gray-800"
								data-testid="bulletin-row"
							>
								<td className="max-w-md px-4 py-3">
									<p className="font-medium text-gray-800 dark:text-gray-100">
										{bulletin.title}
									</p>
									<p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
										{bulletin.body}
									</p>
								</td>
								<td className="px-4 py-3">
									<TypeBadge type={bulletin.type} />
								</td>
								<td className="px-4 py-3">
									<input
										type="checkbox"
										checked={Boolean(bulletin.active)}
										onChange={() => handleToggle(bulletin)}
										aria-label={`Active status for ${bulletin.title}`}
										className="w-4 h-4 accent-gray-900 dark:accent-pink-500"
									/>
								</td>
								<td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
									{formatBulletinDate(bulletin.date)}
								</td>
								<td className="px-4 py-3">
									<div className="flex gap-3">
										<button
											onClick={() => startEdit(bulletin)}
											className="text-blue-600 dark:text-blue-400"
										>
											Edit
										</button>
										<button
											onClick={() => handleDelete(bulletin)}
											className="text-red-500"
										>
											Delete
										</button>
									</div>
								</td>
							</tr>
						))}
						{bulletins.length === 0 && (
							<tr>
								<td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
									No bulletins yet. Use “New bulletin” to publish one.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
				Need to update the dashboard widget? The most recent active bulletin appears there
				automatically. <Link to="/" className="underline hover:text-gray-600 dark:hover:text-gray-300">Back to dashboard</Link>.
			</p>
		</div>
	);
};

export default Announcements;
