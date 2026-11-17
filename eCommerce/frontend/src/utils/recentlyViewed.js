const KEY = "forever-recently-viewed";
const MAX = 8;

export const getRecentlyViewed = () => {
	try {
		const raw = localStorage.getItem(KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
};

export const addRecentlyViewed = (productId) => {
	try {
		const list = getRecentlyViewed().filter((id) => id !== productId);
		list.unshift(productId);
		localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
	} catch {
		// ignore storage errors
	}
};
