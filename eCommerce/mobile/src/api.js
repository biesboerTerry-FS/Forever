// The mobile app talks to the same Express API as the web storefront.
// For a physical device, set EXPO_PUBLIC_API_URL to your computer's LAN URL,
// e.g. EXPO_PUBLIC_API_URL=http://192.168.1.20:4001
const rawApiUrl = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:4001")
	.trim()
	.replace(/\/$/, "");
export const API_URL = /^https?:\/\//i.test(rawApiUrl)
	? rawApiUrl
	: /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(rawApiUrl)
		? `http://${rawApiUrl}`
		: `https://${rawApiUrl}`;

async function request(path, { method = "GET", body, token, headers = {} } = {}) {
	const response = await fetch(`${API_URL}${path}`, {
		method,
		headers: {
			"Content-Type": "application/json",
			...(token ? { token } : {}),
			...headers,
		},
		...(method === "GET" ? {} : { body: JSON.stringify(body || {}) }),
	});

	let data;
	try {
		data = await response.json();
	} catch {
		throw new Error("The server returned an invalid response");
	}

	if (!response.ok) {
		throw new Error(data?.message || `Request failed (${response.status})`);
	}
	return data;
}

export const api = {
	get: (path, token, headers) => request(path, { method: "GET", token, headers }),
	post: (path, body = {}, token, headers) => request(path, { method: "POST", body, token, headers }),
	patch: (path, body = {}, token, headers) => request(path, { method: "PATCH", body, token, headers }),
};
