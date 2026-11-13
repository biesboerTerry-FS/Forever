// The mobile app talks to the same Express API as the web storefront.
// For a physical device, set EXPO_PUBLIC_API_URL to your computer's LAN URL,
// e.g. EXPO_PUBLIC_API_URL=http://192.168.1.20:4001
export const API_URL =
	process.env.EXPO_PUBLIC_API_URL || "http://localhost:4001";

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
};
