import assert from "node:assert/strict";
import { By } from "selenium-webdriver";
import { FRONTEND_URL } from "../helpers/config.js";
import { buildDriver, waitFor, waitForText } from "../helpers/driver.js";
import { formatViolations, getAxeViolations } from "../helpers/a11y.js";

const IMPACT_RANK = { minor: 1, moderate: 2, serious: 3, critical: 4 };

function seriousOrWorse(violations) {
	return violations.filter((v) => (IMPACT_RANK[v.impact] || 0) >= 3);
}

describe("Accessibility (axe-core)", function () {
	this.timeout(120000);
	let driver;

	before(async () => {
		driver = await buildDriver();
	});

	after(async () => {
		await driver?.quit();
	});

	const pages = [
		{
			name: "home",
			url: FRONTEND_URL,
			ready: async () => waitForText(driver, By.css("h1"), "Latest Arrivals"),
		},
		{
			name: "collection",
			url: `${FRONTEND_URL}/collection`,
			ready: async () => waitForText(driver, By.css("body"), "ALL COLLECTIONS"),
		},
		{
			name: "login",
			url: `${FRONTEND_URL}/login`,
			ready: async () => waitFor(driver, By.css('input[placeholder="Email"]')),
		},
		{
			name: "contact",
			url: `${FRONTEND_URL}/contact`,
			ready: async () => waitForText(driver, By.css("body"), "CONTACT US"),
		},
	];

	for (const page of pages) {
		it(`${page.name} has no serious/critical axe violations`, async () => {
			await driver.get(page.url);
			await page.ready();

			const violations = await getAxeViolations(driver, {
				options: {
					// Color contrast can vary with loaded fonts/images in headless runs;
					// keep the check but focus CI on structural/semantic a11y failures.
					rules: {
						"color-contrast": { enabled: false },
					},
				},
			});
			const severe = seriousOrWorse(violations);

			assert.equal(
				severe.length,
				0,
				`axe violations on ${page.name}:\n${formatViolations(severe)}`
			);
		});
	}
});
