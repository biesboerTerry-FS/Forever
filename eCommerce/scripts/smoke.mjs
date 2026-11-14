#!/usr/bin/env node
/**
 * Lightweight smoke tests for local or deployed Forever environments.
 *
 * Usage:
 *   node eCommerce/scripts/smoke.mjs
 *   API_URL=https://api.example.com FRONTEND_URL=https://shop.example.com ADMIN_URL=https://admin.example.com node eCommerce/scripts/smoke.mjs
 *   SMOKE_TIMEOUT_MS=15000 node eCommerce/scripts/smoke.mjs
 *
 * Checks:
 * - API health and core read endpoints
 * - Storefront/admin pages respond
 * - sitemap.xml / robots.txt are served (storefront)
 * - Optional admin login check when ADMIN_EMAIL/ADMIN_PASSWORD provided
 */

const API_URL = (process.env.API_URL || "http://localhost:4001").replace(/\/$/, "");
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5178").replace(/\/$/, "");
const ADMIN_URL = (process.env.ADMIN_URL || "http://localhost:5179").replace(/\/$/, "");
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS || 10000);

const results = [];

const withTimeout = async (promise, label) => {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		return await promise(controller.signal);
	} catch (error) {
		if (error.name === "AbortError") throw new Error(`${label} timed out after ${TIMEOUT_MS}ms`);
		throw error;
	} finally {
		clearTimeout(timer);
	}
};

async function check(name, fn) {
	try {
		await fn();
		results.push({ name, ok: true });
		console.log(`PASS  ${name}`);
	} catch (error) {
		results.push({ name, ok: false, error: error.message });
		console.error(`FAIL  ${name}: ${error.message}`);
	}
}

function expect(condition, message) {
	if (!condition) throw new Error(message);
}

async function fetchText(url, options = {}) {
	return withTimeout(async (signal) => {
		const res = await fetch(url, { ...options, signal });
		const text = await res.text();
		return { res, text };
	}, url);
}

async function fetchJson(url, options = {}) {
	const { res, text } = await fetchText(url, {
		...options,
		headers: { "Content-Type": "application/json", ...(options.headers || {}) },
	});
	let data;
	try {
		data = text ? JSON.parse(text) : null;
	} catch {
		throw new Error(`Expected JSON from ${url} (status ${res.status})`);
	}
	return { res, data, text };
}

(async () => {
	console.log("Running smoke tests...");
	console.log(`API_URL=${API_URL}`);
	console.log(`FRONTEND_URL=${FRONTEND_URL}`);
	console.log(`ADMIN_URL=${ADMIN_URL}`);

	await check("API: GET / responds", async () => {
		const { res } = await fetchText(`${API_URL}/`);
		expect(res.ok, `status ${res.status}`);
	});

	await check("API: GET /api/health is healthy", async () => {
		const { res, data } = await fetchJson(`${API_URL}/api/health`);
		expect(res.ok, `status ${res.status}`);
		expect(data && data.success === true, `unexpected body: ${JSON.stringify(data)}`);
	});

	await check("API: GET /api/product/list returns catalog", async () => {
		const { res, data } = await fetchJson(`${API_URL}/api/product/list`);
		expect(res.ok, `status ${res.status}`);
		expect(data && data.success === true, `unexpected body: ${JSON.stringify(data)}`);
		expect(Array.isArray(data.products), "products is not an array");
		expect(data.products.length > 0, "no products returned (seed database?)");
	});

	await check("Storefront: home page responds", async () => {
		const { res, text } = await fetchText(`${FRONTEND_URL}/`);
		expect(res.ok, `status ${res.status}`);
		expect(/<html|<!doctype/i.test(text), "response does not look like HTML");
	});

	await check("Storefront: collection page responds", async () => {
		const { res, text } = await fetchText(`${FRONTEND_URL}/collection`);
		expect(res.ok, `status ${res.status}`);
		expect(/<html|<!doctype/i.test(text), "response does not look like HTML");
	});

	await check("Storefront: sitemap.xml is served", async () => {
		const { res, text } = await fetchText(`${FRONTEND_URL}/sitemap.xml`);
		expect(res.ok, `status ${res.status}`);
		expect(/<urlset/i.test(text), "sitemap.xml missing <urlset>");
	});

	await check("Storefront: robots.txt is served", async () => {
		const { res, text } = await fetchText(`${FRONTEND_URL}/robots.txt`);
		expect(res.ok, `status ${res.status}`);
		expect(/Sitemap:/i.test(text), "robots.txt missing Sitemap directive");
	});

	await check("Admin: login page responds", async () => {
		const { res, text } = await fetchText(`${ADMIN_URL}/`);
		expect(res.ok, `status ${res.status}`);
		expect(/<html|<!doctype/i.test(text), "response does not look like HTML");
	});

	if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
		await check("API: admin login works with provided credentials", async () => {
			const { res, data } = await fetchJson(`${API_URL}/api/user/admin`, {
				method: "POST",
				body: JSON.stringify({
					email: process.env.ADMIN_EMAIL,
					password: process.env.ADMIN_PASSWORD,
				}),
			});
			expect(res.ok, `status ${res.status}`);
			expect(data && data.success === true && data.token, `unexpected body: ${JSON.stringify(data)}`);
		});
	} else {
		console.log("SKIP  API: admin login works with provided credentials (set ADMIN_EMAIL and ADMIN_PASSWORD to enable)");
	}

	const failed = results.filter((r) => !r.ok);
	console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
	if (failed.length) {
		console.error("Failed checks:");
		for (const f of failed) console.error(`- ${f.name}: ${f.error}`);
		process.exit(1);
	}
})();
