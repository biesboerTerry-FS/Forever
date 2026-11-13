import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SCREENSHOTS_DIR = path.resolve(__dirname, "../screenshots");

export async function buildDriver() {
	const options = new chrome.Options();
	options.addArguments("--headless=new");
	options.addArguments("--disable-dev-shm-usage");
	options.addArguments("--window-size=1440,900");
	// Note: ChromeDriver is provisioned automatically by selenium-manager.
	return new Builder().forBrowser("chrome").setChromeOptions(options).build();
}

export const find = (driver, locator) => driver.findElement(locator);
export const findAll = (driver, locator) => driver.findElements(locator);

export async function waitFor(driver, locator, ms = 15000) {
	return driver.wait(until.elementLocated(locator), ms);
}

// Poll until the element's visible text contains `text` (avoids flakiness
// with until.elementTextContains against React-rendered pages).
export async function waitForText(driver, locator, text, ms = 15000) {
	const deadline = Date.now() + ms;
	let lastError = null;
	while (Date.now() < deadline) {
		try {
			const el = await driver.findElement(locator);
			const current = await el.getText();
			if (current.includes(text)) return el;
		} catch (err) {
			lastError = err; // element not rendered yet / stale — keep polling
		}
		await driver.sleep(250);
	}
	throw new Error(
		`Timed out after ${ms}ms waiting for text "${text}" on ${locator}`
	);
}

export async function waitForUrl(driver, urlPart, ms = 15000) {
	return driver.wait(until.urlContains(urlPart), ms);
}

export async function bodyText(driver) {
	return (await driver.findElement(By.css("body"))).getText();
}

export async function screenshot(driver, name) {
	fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
	const png = await driver.takeScreenshot();
	fs.writeFileSync(path.join(SCREENSHOTS_DIR, name), png, "base64");
}
