import React, { useEffect, useState } from "react";

const KEY = "cookie-consent-v1";
const defaults = { necessary: true, analytics: false, marketing: false, decided: false, updatedAt: null };

export const getCookieConsent = () => {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return { ...defaults };
		const parsed = JSON.parse(raw);
		return { ...defaults, ...parsed, necessary: true };
	} catch {
		return { ...defaults };
	}
};

export const setCookieConsent = (value) => {
	const next = { ...defaults, ...value, necessary: true, decided: true, updatedAt: new Date().toISOString() };
	localStorage.setItem(KEY, JSON.stringify(next));
	window.dispatchEvent(new CustomEvent("cookie-consent-changed", { detail: next }));
	return next;
};

const Toggle = ({ label, description, checked, disabled, onChange }) => (
	<label className={`flex items-start justify-between gap-4 py-3 ${disabled ? "opacity-70" : ""}`}>
		<div>
			<p className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</p>
			<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
		</div>
		<input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="mt-1 w-4 h-4 accent-black dark:accent-white" />
	</label>
);

const CookieConsent = () => {
	const [consent, setConsent] = useState(getCookieConsent);
	const [showBanner, setShowBanner] = useState(!getCookieConsent().decided);
	const [openSettings, setOpenSettings] = useState(false);
	const [draft, setDraft] = useState(getCookieConsent);

	useEffect(() => {
		const open = () => { const c = getCookieConsent(); setDraft(c); setOpenSettings(true); };
		const sync = () => { const c = getCookieConsent(); setConsent(c); setShowBanner(!c.decided); };
		window.addEventListener("open-cookie-settings", open);
		window.addEventListener("cookie-consent-changed", sync);
		window.addEventListener("storage", sync);
		return () => {
			window.removeEventListener("open-cookie-settings", open);
			window.removeEventListener("cookie-consent-changed", sync);
			window.removeEventListener("storage", sync);
		};
	}, []);

	const acceptAll = () => { const c = setCookieConsent({ analytics: true, marketing: true }); setConsent(c); setShowBanner(false); setOpenSettings(false); };
	const rejectNonEssential = () => { const c = setCookieConsent({ analytics: false, marketing: false }); setConsent(c); setShowBanner(false); setOpenSettings(false); };
	const save = () => { const c = setCookieConsent({ analytics: !!draft.analytics, marketing: !!draft.marketing }); setConsent(c); setShowBanner(false); setOpenSettings(false); };

	const buttonBase = "px-5 py-2.5 text-sm font-medium transition-colors duration-200 rounded-full";
	const buttonOutline = `${buttonBase} border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100`;
	const buttonPrimary = `${buttonBase} bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 shadow-soft`;

	return (
		<>
			{showBanner && (
				<div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-elevated">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="max-w-2xl">
								<p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Cookie settings</p>
								<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
									We use essential cookies/local storage for core site features (sign-in, cart, preferences). With your permission, we also use analytics and marketing cookies to improve the experience.
								</p>
							</div>
							<div className="flex flex-col gap-2 sm:flex-row sm:items-center shrink-0">
								<button onClick={() => { const c = getCookieConsent(); setDraft(c); setOpenSettings(true); }} className={buttonOutline}>Customize</button>
								<button onClick={rejectNonEssential} className={buttonOutline}>Reject non-essential</button>
								<button onClick={acceptAll} className={buttonPrimary}>Accept all</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{openSettings && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-label="Cookie preferences">
					<div className="w-full max-w-lg p-5 bg-white border border-gray-200 rounded-2xl shadow-elevated dark:bg-gray-900 dark:border-gray-700">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cookie preferences</h2>
								<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Manage how we use cookies and similar technologies.</p>
							</div>
							<button onClick={() => setOpenSettings(false)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100" aria-label="Close">✕</button>
						</div>
						<div className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">
							<Toggle label="Necessary" description="Required for core functionality like security, sign-in, cart, and preferences." checked={true} disabled={true} onChange={() => {}} />
							<Toggle label="Analytics" description="Helps us understand site usage and improve performance and content." checked={!!draft.analytics} onChange={(v) => setDraft({ ...draft, analytics: v })} />
							<Toggle label="Marketing" description="Used for personalized offers and marketing measurement (demo setting)." checked={!!draft.marketing} onChange={(v) => setDraft({ ...draft, marketing: v })} />
						</div>
						<div className="flex flex-col gap-2 mt-5 sm:flex-row sm:justify-end">
							<button onClick={rejectNonEssential} className={buttonOutline}>Reject non-essential</button>
							<button onClick={save} className={buttonPrimary}>Save preferences</button>
						</div>
						{consent.updatedAt && <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Last updated: {new Date(consent.updatedAt).toLocaleString()}</p>}
					</div>
				</div>
			)}
		</>
	);
};

export default CookieConsent;
