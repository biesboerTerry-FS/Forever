import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import { formatDate, loadMessages, saveMessages } from "../utils/ops";

const Messages = ({ token }) => {
	const [messages, setMessages] = useState(loadMessages);
	const [selectedId, setSelectedId] = useState(null);
	const [showCompose, setShowCompose] = useState(false);
	const [form, setForm] = useState({ subject: "", body: "" });

	useEffect(() => {
		let active = true;
		const load = async () => {
			if (!token || !backendUrl) return;
			try {
				const response = await axios.get(`${backendUrl}/api/messages`, {
					headers: { token },
				});
				if (active && response.data?.success && Array.isArray(response.data.messages)) {
					const list = response.data.messages.map((message) => ({
						...message,
						id: message.id || message._id,
					}));
					setMessages(list);
					saveMessages(list);
				}
			} catch {
				// Keep the seeded/offline inbox when the API is unavailable.
			}
		};
		load();
		return () => {
			active = false;
		};
	}, [token]);

	const inbox = useMemo(
		() => messages.filter((message) => message.toRole === "admin"),
		[messages]
	);
	const selected = inbox.find((message) => message.id === selectedId) || null;

	const open = async (message) => {
		setSelectedId(message.id);
		if (message.read) return;
		const next = messages.map((item) =>
			item.id === message.id ? { ...item, read: true } : item
		);
		setMessages(next);
		saveMessages(next);
		if (token && backendUrl && !String(message.id).startsWith("demo-")) {
			try {
				await axios.patch(`${backendUrl}/api/messages/${message.id}/read`, {}, { headers: { token } });
			} catch {
				// local read state still persists
			}
		}
	};

	const send = async (event) => {
		event.preventDefault();
		if (!form.subject.trim() || !form.body.trim()) return;
		const local = {
			id: `local-${Date.now()}`,
			toRole: "employee",
			subject: form.subject.trim(),
			body: form.body.trim(),
			senderName: "Admin",
			senderRole: "admin",
			read: false,
			date: Date.now(),
		};
		if (token && backendUrl) {
			try {
				const response = await axios.post(
					`${backendUrl}/api/messages`,
					{ subject: form.subject, body: form.body, toRole: "employee" },
					{ headers: { token } }
				);
				if (response.data?.success && response.data.message) {
					local.id = response.data.message._id || response.data.message.id || local.id;
				}
			} catch {
				// saved locally below
			}
		}
		const next = [local, ...messages];
		setMessages(next);
		saveMessages(next);
		setForm({ subject: "", body: "" });
		setShowCompose(false);
		toast.success("Message sent.");
	};

	return (
		<div data-testid="admin-messages">
			<div className="flex flex-wrap items-center justify-between gap-3 mb-4">
				<div>
					<h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Messages</h3>
					<p className="text-xs text-gray-500 dark:text-gray-400">
						{inbox.filter((message) => !message.read).length} unread in your inbox
					</p>
				</div>
				<button
					type="button"
					onClick={() => setShowCompose((value) => !value)}
					className="px-4 py-2 text-sm text-white bg-black rounded-lg dark:bg-white dark:text-gray-900"
				>
					{showCompose ? "Cancel" : "New message"}
				</button>
			</div>

			{showCompose && (
				<form onSubmit={send} className="grid gap-3 p-4 mb-4 bg-white rounded-2xl shadow-sm dark:bg-gray-900">
					<input
						aria-label="Subject"
						placeholder="Subject"
						value={form.subject}
						maxLength={200}
						onChange={(event) => setForm({ ...form, subject: event.target.value })}
						className="px-3 py-2 text-sm border rounded-lg dark:bg-gray-950 dark:border-gray-700"
						required
					/>
					<textarea
						aria-label="Message body"
						placeholder="Write your message…"
						value={form.body}
						maxLength={4000}
						rows={4}
						onChange={(event) => setForm({ ...form, body: event.target.value })}
						className="px-3 py-2 text-sm border rounded-lg dark:bg-gray-950 dark:border-gray-700"
						required
					/>
					<div>
						<button type="submit" className="px-4 py-2 text-sm text-white bg-black rounded-lg dark:bg-white dark:text-gray-900">
							Send to employees
						</button>
					</div>
				</form>
			)}

			<div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
				<div data-testid="messages-inbox" className="overflow-hidden bg-white rounded-2xl shadow-sm dark:bg-gray-900">
					{inbox.length === 0 ? (
						<p className="p-6 text-sm text-gray-500">Your inbox is empty.</p>
					) : (
						inbox.map((message) => (
							<button
								type="button"
								key={message.id}
								data-testid="message-row"
								onClick={() => open(message)}
								className={`w-full px-4 py-3 text-left border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60 ${
									selectedId === message.id ? "bg-pink-50/60 dark:bg-pink-500/10" : ""
								}`}
							>
								<div className="flex items-center justify-between gap-3">
									<p data-testid="message-subject" className="text-sm font-medium text-gray-800 dark:text-gray-100">
										{message.subject}
										{!message.read && <span className="ml-2 inline-block w-2 h-2 bg-pink-500 rounded-full align-middle" />}
									</p>
									<span className="text-[11px] text-gray-400">{formatDate(message.date)}</span>
								</div>
								<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
									{message.senderName || "Forever Team"} · {message.read ? "Read" : "Unread"}
								</p>
							</button>
						))
					)}
				</div>

				<div data-testid="message-detail" className="p-5 bg-white rounded-2xl shadow-sm dark:bg-gray-900">
					{selected ? (
						<>
							<p className="text-xs tracking-wide text-gray-400 uppercase">{selected.senderName}</p>
							<h4 className="mt-1 text-lg font-medium text-gray-800 dark:text-gray-100">{selected.subject}</h4>
							<p className="mt-1 text-xs text-gray-400">{formatDate(selected.date)}</p>
							<p className="mt-4 text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">{selected.body}</p>
						</>
					) : (
						<p className="text-sm text-gray-500 dark:text-gray-400">Select a message to read it.</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default Messages;
