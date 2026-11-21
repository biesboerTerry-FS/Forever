// Profile data is stored locally for this demo storefront. The shopper API
// currently has no /api/user/update-profile or /api/address/* endpoints, so
// localStorage is the source of truth here. Swap these helpers for API calls
// when those endpoints exist; the Profile page only talks to this module.

const KEYS = {
	profile: "profile-info",
	addresses: "profile-addresses",
	cards: "profile-demo-cards",
};

export const DEMO_CARD = {
	id: "demo-test-card-4242",
	brand: "Visa",
	label: "Test card",
	last4: "4242",
	expiry: "12/30",
};

const read = (key, fallback) => {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		const parsed = JSON.parse(raw);
		return parsed ?? fallback;
	} catch {
		return fallback;
	}
};

const write = (key, value) => {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// Storage can be unavailable (private mode / quota) — the page still
		// works for the current session.
	}
};

// Flags distinguish "never seeded" from "shopper deliberately deleted all".
const SEED_FLAGS = {
	addresses: "profile-addresses-seeded",
	cards: "profile-demo-cards-seeded",
};

export const wasSeeded = (kind) => {
	try {
		return localStorage.getItem(SEED_FLAGS[kind]) === "1";
	} catch {
		return false;
	}
};
export const markSeeded = (kind) => {
	try {
		localStorage.setItem(SEED_FLAGS[kind], "1");
	} catch {
		// ignore
	}
};

export const loadProfile = (fallback = null) => read(KEYS.profile, fallback);
export const saveProfile = (profile) => write(KEYS.profile, profile);

// First visit: one clearly-marked demo address so the list isn't empty.
export const seedAddress = () => ({
	id: "demo-home-address",
	label: "Home",
	firstName: "Forever",
	lastName: "Shopper",
	email: "shopper@forever.test",
	street: "100 Example Street",
	city: "Portland",
	state: "OR",
	zipcode: "97209",
	country: "United States",
	phone: "5550100",
	isDefault: true,
});

export const loadAddresses = () => {
	const saved = read(KEYS.addresses, null);
	return Array.isArray(saved) ? saved : [seedAddress()];
};
export const saveAddresses = (addresses) => write(KEYS.addresses, addresses);

export const seedCard = () => ({ ...DEMO_CARD });

export const loadDemoCards = () => {
	const saved = read(KEYS.cards, null);
	// An intentionally empty saved array means the shopper removed every demo
	// card — don't re-seed it on reload.
	return Array.isArray(saved) ? saved : [seedCard()];
};
export const saveDemoCards = (cards) => write(KEYS.cards, cards);
