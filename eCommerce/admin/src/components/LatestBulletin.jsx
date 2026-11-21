import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	BULLETINS_KEY,
	formatBulletinDate,
	getActiveBulletins,
} from "../utils/bulletins";

const TYPE_STYLES = {
	info: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
	warning: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
	promotion: "bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
};

const dismissKey = (id) => `forever-bulletin-dismissed:${id}`;

/** Compact dashboard card for the newest active bulletin. Dismissal is session-only. */
const LatestBulletin = () => {
	const [bulletin, setBulletin] = useState(null);
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		const sync = () => {
			const latest = getActiveBulletins()[0] || null;
			setBulletin(latest);
			setDismissed(
				Boolean(latest && window.sessionStorage.getItem(dismissKey(latest.id)))
			);
		};
		sync();
		const onStorage = (event) => {
			if (event.key === BULLETINS_KEY || event.key === null) sync();
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, []);

	if (!bulletin || dismissed) return null;

	const badgeStyle = TYPE_STYLES[bulletin.type] || TYPE_STYLES.info;

	return (
		<section
			data-testid="latest-bulletin"
			className="relative mb-4 p-4 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800"
		>
			<button
				type="button"
				onClick={() => {
					window.sessionStorage.setItem(dismissKey(bulletin.id), "1");
					setDismissed(true);
				}}
				aria-label="Dismiss bulletin"
				title="Dismiss for this session"
				className="absolute top-3 right-3 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
					<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
				</svg>
			</button>
			<div className="flex flex-wrap items-center gap-2 pr-6">
				<span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
					Latest bulletin
				</span>
				<span className={`px-2 py-0.5 text-[11px] font-medium rounded-full capitalize ${badgeStyle}`}>
					{bulletin.type}
				</span>
				<span className="text-[11px] text-gray-400 dark:text-gray-500">
					{formatBulletinDate(bulletin.date)}
				</span>
			</div>
			<p className="mt-1.5 text-sm font-medium text-gray-800 dark:text-gray-100">
				{bulletin.title}
			</p>
			<p className="mt-1 text-xs text-gray-600 line-clamp-2 dark:text-gray-400">
				{bulletin.body}
			</p>
			<Link
				to="/announcements"
				className="inline-block mt-2 text-xs font-medium text-pink-600 hover:underline dark:text-pink-400"
			>
				View all announcements →
			</Link>
		</section>
	);
};

export default LatestBulletin;
