import axios from "axios";
import {
	loadAddresses,
	loadDemoCards,
	loadProfile,
	markSeeded,
	saveAddresses,
	saveDemoCards,
	saveProfile,
	seedAddress,
	seedCard,
	wasSeeded,
} from "./profileStore";

// All profile writes go through the authenticated backend when a shopper
// token is available. Signed-out / demo sessions, or an unreachable API, fall
// back to localStorage so the storefront stays usable.

const canSync = ({ backendUrl, token }) => Boolean(backendUrl && token);

const call = async ({ ctx, method, path, data }) => {
	const { data: body } = await axios({
		method,
		url: `${String(ctx.backendUrl).replace(/\/$/, "")}${path}`,
		data,
		headers: { token: ctx.token },
	});
	if (!body || body.success === false) throw new Error(body?.message || "Request failed");
	return body;
};

const toApiAddress = (address) => ({
	label: address.label,
	firstName: address.firstName,
	lastName: address.lastName,
	email: address.email,
	phone: address.phone,
	line1: address.street || address.line1 || "",
	line2: address.line2 || "",
	city: address.city,
	state: address.state,
	zip: address.zipcode || address.zip || "",
	country: address.country,
	isDefault: Boolean(address.isDefault),
});

const fromApiAddress = (address) => ({
	id: address.id,
	label: address.label,
	firstName: address.firstName,
	lastName: address.lastName,
	email: address.email,
	phone: address.phone,
	street: address.line1,
	line2: address.line2,
	city: address.city,
	state: address.state,
	zipcode: address.zip,
	country: address.country,
	isDefault: Boolean(address.isDefault),
});

const toApiCard = (card) => ({
	label: card.label,
	brand: card.brand,
	last4: card.last4,
	exp: card.expiry || card.exp || "",
});

const fromApiCard = (card) => ({
	id: card.id,
	label: card.label,
	brand: card.brand,
	last4: card.last4,
	expiry: card.exp || "",
	isDefault: Boolean(card.isDefault),
});

// ---------- Personal info ----------
export const fetchProfile = async (ctx) => {
	if (!canSync(ctx)) return loadProfile();
	try {
		const body = await call({ ctx, method: "get", path: "/api/user/profile" });
		saveProfile(body.profile);
		return body.profile;
	} catch {
		return loadProfile();
	}
};

export const pushProfile = async (ctx, profile) => {
	if (!canSync(ctx)) return { synced: false };
	try {
		const body = await call({ ctx, method: "patch", path: "/api/user/profile", data: profile });
		saveProfile(body.profile);
		return { synced: true, profile: body.profile };
	} catch {
		return { synced: false };
	}
};

// ---------- Addresses ----------
export const fetchAddresses = async (ctx) => {
	if (!canSync(ctx)) {
		markSeeded("addresses");
		return loadAddresses();
	}
	try {
		let body = await call({ ctx, method: "get", path: "/api/address" });
		let addresses = body.addresses.map(fromApiAddress);
		if (addresses.length === 0 && !wasSeeded("addresses")) {
			body = await call({
				ctx,
				method: "post",
				path: "/api/address",
				data: toApiAddress(seedAddress()),
			});
			addresses = body.addresses.map(fromApiAddress);
		}
		markSeeded("addresses");
		saveAddresses(addresses);
		return addresses;
	} catch {
		return loadAddresses();
	}
};

const addressMutation = async (ctx, method, path, data) => {
	if (!canSync(ctx)) return { synced: false };
	try {
		const body = await call({ ctx, method, path, data });
		const addresses = body.addresses.map(fromApiAddress);
		saveAddresses(addresses);
		return { synced: true, addresses };
	} catch {
		return { synced: false };
	}
};

export const createAddress = (ctx, address) =>
	addressMutation(ctx, "post", "/api/address", toApiAddress(address));
export const updateAddress = (ctx, id, address) =>
	addressMutation(ctx, "patch", `/api/address/${id}`, toApiAddress(address));
export const removeAddress = (ctx, id) =>
	addressMutation(ctx, "delete", `/api/address/${id}`);
export const makeDefaultAddress = (ctx, id) =>
	addressMutation(ctx, "patch", `/api/address/${id}/default`);

// ---------- Demo payment methods (masked metadata only) ----------
export const fetchDemoCards = async (ctx) => {
	if (!canSync(ctx)) {
		markSeeded("cards");
		return loadDemoCards();
	}
	try {
		let body = await call({ ctx, method: "get", path: "/api/payment-methods" });
		let cards = body.paymentMethods.map(fromApiCard);
		if (cards.length === 0 && !wasSeeded("cards")) {
			body = await call({
				ctx,
				method: "post",
				path: "/api/payment-methods",
				data: toApiCard(seedCard()),
			});
			cards = body.paymentMethods.map(fromApiCard);
		}
		markSeeded("cards");
		saveDemoCards(cards);
		return cards;
	} catch {
		return loadDemoCards();
	}
};

export const createDemoCard = async (ctx, card) => {
	if (!canSync(ctx)) return { synced: false };
	try {
		const body = await call({
			ctx,
			method: "post",
			path: "/api/payment-methods",
			data: toApiCard(card),
		});
		const cards = body.paymentMethods.map(fromApiCard);
		saveDemoCards(cards);
		return { synced: true, cards };
	} catch {
		return { synced: false };
	}
};

export const removeDemoCard = async (ctx, id) => {
	if (!canSync(ctx)) return { synced: false };
	try {
		const body = await call({ ctx, method: "delete", path: `/api/payment-methods/${id}` });
		const cards = body.paymentMethods.map(fromApiCard);
		saveDemoCards(cards);
		return { synced: true, cards };
	} catch {
		return { synced: false };
	}
};
