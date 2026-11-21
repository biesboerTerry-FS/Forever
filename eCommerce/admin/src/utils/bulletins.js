// Message / bulletin storage for the admin panel.
//
// Demo mode only: bulletins are persisted in localStorage under
// `forever-bulletins`. No backend is involved, so announcements are per-browser.
// A few examples are seeded on the very first load so the module is not empty.

export const BULLETINS_KEY = "forever-bulletins";

export const BULLETIN_TYPES = ["info", "warning", "promotion"];

const DAY = 24 * 60 * 60 * 1000;

const seedBulletins = () => {
	const now = Date.now();
	return [
		{
			id: "bulletin-holiday-shipping",
			title: "Holiday shipping schedule",
			body: "Orders placed after December 20 will ship the first business day in January. Please update any customer-facing delivery estimates before then.",
			type: "info",
			active: true,
			date: new Date(now - DAY).toISOString(),
		},
		{
			id: "bulletin-summer-sale",
			title: "Promotion: 20% off summer collection",
			body: "The summer collection promotion is live across the storefront. Feature the campaign products at the top of the catalog while it runs.",
			type: "promotion",
			active: true,
			date: new Date(now - 3 * DAY).toISOString(),
		},
		{
			id: "bulletin-warehouse-maintenance",
			title: "Warehouse maintenance window",
			body: "Scheduled maintenance may temporarily slow order fulfillment. Keep an eye on the orders page for anything stuck in packing.",
			type: "warning",
			active: false,
			date: new Date(now - 7 * DAY).toISOString(),
		},
	];
};

/** Read all bulletins, seeding demo data the first time the key is absent. */
export const loadBulletins = () => {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(BULLETINS_KEY);
		if (raw === null) {
			const seeded = seedBulletins();
			window.localStorage.setItem(BULLETINS_KEY, JSON.stringify(seeded));
			return seeded;
		}
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) throw new Error("Invalid bulletin data");
		return parsed;
	} catch (error) {
		console.warn("Could not read bulletins, resetting demo data:", error?.message);
		const seeded = seedBulletins();
		try {
			window.localStorage.setItem(BULLETINS_KEY, JSON.stringify(seeded));
		} catch (storageError) {
			console.warn("Could not persist bulletins:", storageError?.message);
		}
		return seeded;
	}
};

/** Persist the full bulletin list. */
export const saveBulletins = (bulletins) => {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(BULLETINS_KEY, JSON.stringify(bulletins));
	} catch (error) {
		console.warn("Could not persist bulletins:", error?.message);
	}
};

const byNewest = (a, b) => new Date(b.date || 0) - new Date(a.date || 0);

/**
 * Active bulletins, newest first. Used by the dashboard widget.
 * Exported from the Announcements module as well for convenience.
 */
export const getActiveBulletins = () =>
	loadBulletins()
		.filter((bulletin) => bulletin.active)
		.slice()
		.sort(byNewest);

/** Return the single most recent active bulletin, if any. */
export const getLatestBulletin = () => getActiveBulletins()[0] || null;

/** Create or update a bulletin. Editing keeps its original date. */
export const upsertBulletin = (bulletin) => {
	const bulletins = loadBulletins();
	const now = new Date().toISOString();
	if (bulletin.id && bulletins.some((item) => item.id === bulletin.id)) {
		const updated = bulletins.map((item) =>
			item.id === bulletin.id ? { ...item, ...bulletin } : item
		);
		saveBulletins(updated);
		return updated;
	}
	const created = {
		...bulletin,
		id: `bulletin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		date: now,
	};
	saveBulletins([created, ...bulletins]);
	return [created, ...bulletins];
};

export const deleteBulletin = (id) => {
	const updated = loadBulletins().filter((item) => item.id !== id);
	saveBulletins(updated);
	return updated;
};

export const toggleBulletin = (id) => {
	const updated = loadBulletins().map((item) =>
		item.id === id ? { ...item, active: !item.active } : item
	);
	saveBulletins(updated);
	return updated;
};

export const formatBulletinDate = (date) => {
	if (!date) return "—";
	const parsed = new Date(date);
	if (Number.isNaN(parsed.getTime())) return "—";
	return parsed.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};
