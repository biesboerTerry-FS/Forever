import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

let axeSource;
try {
	axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
} catch {
	axeSource = null;
}

// Inject axe-core into the current page and return violations.
// Fails fast with a clear message if axe can't run, so CI stays actionable.
export async function getAxeViolations(driver, context = {}) {
	if (!axeSource) {
		throw new Error("axe-core is not installed. Run npm install in eCommerce/e2e.");
	}

	await driver.executeScript(axeSource);

	const results = await driver.executeAsyncScript(function (options, done) {
		/* global axe */
		try {
			axe
				.run(document, options || {})
				.then(function (res) {
					done({ ok: true, violations: res.violations || [] });
				})
				.catch(function (err) {
					done({ ok: false, error: err && err.message ? err.message : String(err) });
				});
		} catch (err) {
			done({ ok: false, error: err && err.message ? err.message : String(err) });
		}
	}, context.options || null);

	if (!results || !results.ok) {
		throw new Error(`axe.run failed: ${results?.error || "unknown error"}`);
	}

	return results.violations;
}

export function formatViolations(violations) {
	return violations
		.map((v) => {
			const nodes = (v.nodes || [])
				.slice(0, 5)
				.map((n) => `    - ${n.target?.join(", ")}: ${n.failureSummary || ""}`)
				.join("\n");
			return `${v.id} (${v.impact}): ${v.help}\n  ${v.helpUrl}\n${nodes}`;
		})
		.join("\n\n");
}
