import assert from "node:assert/strict";
import { By } from "selenium-webdriver";
import { ADMIN_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from "../helpers/config.js";
import {
	buildDriver,
	find,
	waitFor,
	waitForText,
	screenshot,
} from "../helpers/driver.js";

describe("Admin panel (Selenium)", function () {
	this.timeout(90000);
	let driver;

	before(async () => {
		driver = await buildDriver();
	});
	after(async () => {
		await driver?.quit();
	});

	it("shows the login form and admin can sign in to the dashboard", async () => {
		await driver.get(ADMIN_URL);
		// Start from a signed-out state so a leftover token can't skip login.
		await driver.executeScript("localStorage.clear()");
		await driver.get(ADMIN_URL);
		assert.equal(await driver.getTitle(), "Forever - Admin Panel");

		await waitForText(driver, By.css("h1"), "Admin Panel");
		await find(driver, By.css('input[placeholder="email@example.com"]')).then(
			(el) => el.sendKeys(ADMIN_EMAIL)
		);
		await find(driver, By.css('input[placeholder="password"]')).then((el) =>
			el.sendKeys(ADMIN_PASSWORD)
		);
		await find(
			driver,
			By.xpath('//button[normalize-space()="Login"]')
		).then((el) => el.click());

		// Sidebar links prove the login succeeded
		await waitFor(driver, By.css('a[href="/add"]'));
		const sidebarText = await (
			await find(driver, By.css("body"))
		).getText();
		assert.match(sidebarText, /Dashboard/);
		assert.match(sidebarText, /Add Items/);
		assert.match(sidebarText, /List Items/);
		assert.match(sidebarText, /Orders/);

		// The analytics dashboard is the landing page.
		await waitForText(driver, By.css("body"), "TOTAL REVENUE");
		await waitForText(driver, By.css("body"), "Revenue — last 7 days");
		await waitForText(driver, By.css("body"), "Orders by status");
		await waitForText(driver, By.css("body"), "Top products");

		await screenshot(driver, "admin.png");
	});

	it("rejects wrong admin credentials", async () => {
		await driver.get(ADMIN_URL);
		// Clear any stored token by reloading with a fresh state
		await driver.executeScript("localStorage.clear()");
		await driver.get(ADMIN_URL);
		await waitForText(driver, By.css("h1"), "Admin Panel");

		await find(driver, By.css('input[placeholder="email@example.com"]')).then(
			(el) => el.sendKeys("nobody@example.com")
		);
		await find(driver, By.css('input[placeholder="password"]')).then((el) =>
			el.sendKeys("wrong-password")
		);
		await find(
			driver,
			By.xpath('//button[normalize-space()="Login"]')
		).then((el) => el.click());

		await driver.sleep(1500);
		const text = await (await find(driver, By.css("body"))).getText();
		assert.match(text, /Admin Panel/, "should still be on the login form");
	});
});
