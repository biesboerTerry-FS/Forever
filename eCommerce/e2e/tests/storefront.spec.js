import assert from "node:assert/strict";
import { By } from "selenium-webdriver";
import { FRONTEND_URL, API_URL } from "../helpers/config.js";
import {
	buildDriver,
	find,
	findAll,
	waitFor,
	waitForText,
	waitForUrl,
	bodyText,
	screenshot,
} from "../helpers/driver.js";

describe("Storefront (Selenium)", function () {
	this.timeout(90000);
	let driver;

	before(async () => {
		driver = await buildDriver();
	});
	after(async () => {
		await driver?.quit();
	});

	it("home page loads with hero and product cards", async () => {
		await driver.get(FRONTEND_URL);
		assert.equal(await driver.getTitle(), "Forever");

		await waitForText(driver, By.css("h1"), "Latest Arrivals");
		// Seeded catalog must produce product cards linked to /product/:id
		const cards = await findAll(driver, By.css('a[href^="/product/"]'));
		assert.ok(cards.length > 0, `expected product cards, got ${cards.length}`);

		await screenshot(driver, "home.png");
	});

	it("collection page shows all products and filters work", async () => {
		await driver.get(`${FRONTEND_URL}/collection`);
		await waitForText(driver, By.css("body"), "ALL COLLECTIONS");

		const all = await findAll(driver, By.css('a[href^="/product/"]'));
		assert.ok(all.length > 10, `expected many products, got ${all.length}`);

		// Check the "Men" category filter -> fewer products than "all"
		const menCheckbox = await find(driver, By.css('input[value="Men"]'));
		await menCheckbox.click();
		await driver.sleep(800); // let React re-render the filtered grid
		const men = await findAll(driver, By.css('a[href^="/product/"]'));
		assert.ok(
			men.length < all.length,
			`Men filter should narrow the grid (${men.length} vs ${all.length})`
		);

		await screenshot(driver, "collection.png");
	});

	it("header search icon opens the collection search bar and filters results", async () => {
		// Start on the home page, then use the header search icon.
		await driver.get(FRONTEND_URL);
		await waitForText(driver, By.css("h1"), "Latest Arrivals");
		await find(
			driver,
			By.xpath("//button[@aria-label='Search products']")
		).then((el) => el.click());

		// It should navigate to the collection page and focus the search input.
		await waitForUrl(driver, "collection");
		const search = await waitFor(
			driver,
			By.css('input[placeholder="Search products, categories…"]')
		);
		await driver.wait(async () => {
			const focused = await driver.switchTo().activeElement();
			return (await focused.getAttribute("placeholder"))?.includes("Search");
		}, 5000);

		// Wait for the grid to load before counting the baseline.
		await waitFor(driver, By.css('a[href^="/product/"]'));
		const before = (await findAll(driver, By.css('a[href^="/product/"]')))
			.length;
		await search.sendKeys("t-shirt");
		await waitForText(driver, By.css("body"), "products for");
		const after = (await findAll(driver, By.css('a[href^="/product/"]')))
			.length;
		assert.ok(after > 0, "search should still match some products");
		assert.ok(after < before, `search should narrow grid (${after} vs ${before})`);
	});

	it("shows an empty state and clears the search", async () => {
		await driver.get(`${FRONTEND_URL}/collection`);
		const search = await waitFor(
			driver,
			By.css('input[placeholder="Search products, categories…"]')
		);
		await search.sendKeys("zzzz-no-such-product");
		await waitForText(driver, By.css("body"), "No products found");

		await find(
			driver,
			By.xpath('//button[normalize-space()="Clear search"]')
		).then((el) => el.click());
		await waitFor(driver, By.css('a[href^="/product/"]'));
	});

	it("product page: pick a size and add to cart", async () => {
		await driver.get(FRONTEND_URL);
		const card = await waitFor(driver, By.css('a[href^="/product/"]'));
		await card.click();

		const addBtn = await waitFor(
			driver,
			By.xpath('//button[normalize-space()="ADD TO CART"]')
		);
		// Select size "M", then add
		await find(driver, By.xpath('//button[normalize-space()="M"]')).then(
			(el) => el.click()
		);
		await addBtn.click();

		// Cart badge in the nav should now read "1"
		await waitForText(driver, By.css('a[href="/cart"] p'), "1");
	});

	// The cart lives in React state, so tests that need it must add the item
	// and then navigate with SPA links (a full page reload would reset it).
	async function addFirstProductToCart() {
		await driver.get(FRONTEND_URL);
		const card = await waitFor(driver, By.css('a[href^="/product/"]'));
		await card.click();
		await waitFor(
			driver,
			By.xpath('//button[normalize-space()="ADD TO CART"]')
		);
		await find(driver, By.xpath('//button[normalize-space()="M"]')).then(
			(el) => el.click()
		);
		await find(
			driver,
			By.xpath('//button[normalize-space()="ADD TO CART"]')
		).then((el) => el.click());
		await waitForText(driver, By.css('a[href="/cart"] p'), "1");
		// SPA link to the cart (no reload -> cart state preserved)
		await find(driver, By.css('a[href="/cart"]')).then((el) => el.click());
		await waitForText(driver, By.css("body"), "PROCEED TO CHECKOUT");
	}

	it("cart page shows the item and quantity changes update totals", async () => {
		await addFirstProductToCart();
		const text = await bodyText(driver);
		// First catalog product is "Women Round Neck Cotton Top" ($100)
		assert.match(text, /Women Round Neck Cotton Top/);

		const qty = await waitFor(driver, By.css('input[type="number"]'));
		await qty.clear();
		await qty.sendKeys("2");
		// Subtotal should become $200.00
		await waitForText(driver, By.css("body"), "200.00");
	});

	it("checkout page shows delivery form and payment methods", async () => {
		await addFirstProductToCart();
		await find(
			driver,
			By.xpath('//button[normalize-space()="PROCEED TO CHECKOUT"]')
		).then((el) => el.click());

		// Checkout now requires an account: the shopper is sent to login and
		// returned to checkout after signing in.
		await waitForUrl(driver, "/login");
		const loginUrl = await driver.getCurrentUrl();
		assert.match(loginUrl, /redirect=/);
		assert.match(loginUrl, /place-order/);

		await find(driver, By.css('input[placeholder="Email"]')).then((el) =>
			el.sendKeys("demo@forever.test")
		);
		await find(driver, By.css('input[placeholder="Password"]')).then((el) =>
			el.sendKeys("demo1234")
		);
		await find(
			driver,
			By.xpath('//button[normalize-space()="Sign In"]')
		).then((el) => el.click());

		await waitForUrl(driver, "/place-order");
		await waitFor(driver, By.css('input[name="firstName"]'));
		assert.ok(
			await find(driver, By.css('input[name="firstName"]')).isDisplayed()
		);
		const text = await bodyText(driver);
		assert.match(text, /CASH ON DELIVERY/);
		assert.match(text, /PLACE ORDER/);

		await screenshot(driver, "checkout.png");

		// Leave the next tests signed out.
		await driver.executeScript("localStorage.clear()");
	});

	it("login page renders and toggles to sign up", async () => {
		await driver.get(`${FRONTEND_URL}/login`);
		await waitFor(driver, By.css('input[placeholder="Email"]'));
		const toggle = await find(
			driver,
			By.xpath('//button[normalize-space()="Create Account"]')
		);
		await toggle.click();
		await waitFor(driver, By.css('input[placeholder="Full Name"]'));
		await waitForText(driver, By.css("body"), "Sign Up");
	});

	it("footer links open the delivery and privacy pages", async () => {
		await driver.get(FRONTEND_URL);

		await find(
			driver,
			By.xpath('//a[normalize-space()="Delivery & Shipping"]')
		).then((el) => el.click());
		await waitForUrl(driver, "/delivery");
		await waitForText(driver, By.css("body"), "Shipping rates");
		await waitForText(driver, By.css("body"), "Tracking your order");

		await find(
			driver,
			By.xpath('//a[normalize-space()="Privacy Policy"]')
		).then((el) => el.click());
		await waitForUrl(driver, "/privacy");
		await waitForText(driver, By.css("body"), "Information we collect");
	});

	it("returns and terms pages render real content", async () => {
		await driver.get(`${FRONTEND_URL}/returns`);
		await waitForText(driver, By.css("body"), "Return eligibility");
		await waitForText(driver, By.css("body"), "Refunds");

		await driver.get(`${FRONTEND_URL}/terms`);
		await waitForText(driver, By.css("body"), "Orders and pricing");
		await waitForText(driver, By.css("body"), "Payments");
	});

	it("product page shows live reviews and a review form", async () => {
		const catalog = await (
			await fetch(`${API_URL}/api/product/list`)
		).json();
		const product = catalog.products[0];

		await driver.get(`${FRONTEND_URL}/product/${product._id}`);
		await waitForText(driver, By.css("body"), product.name);
		await waitForText(driver, By.css("body"), "Customer Reviews");
		await waitForText(driver, By.css("body"), "Write a review");
		await waitForText(driver, By.css("body"), "Based on");

		await screenshot(driver, "reviews.png");
	});

	it("signed-out shopper is asked to log in when saving to the wishlist", async () => {
		// Ensure we start signed out.
		await driver.get(FRONTEND_URL);
		await driver.executeScript("localStorage.clear()");
		await driver.navigate().refresh();

		const catalog = await (
			await fetch(`${API_URL}/api/product/list`)
		).json();
		const product = catalog.products[0];

		await driver.get(`${FRONTEND_URL}/product/${product._id}`);
		const heart = await waitFor(
			driver,
			By.css('button[aria-label="Save to wishlist"]')
		);
		await heart.click();
		await waitForUrl(driver, "/login");
	});

	it("demo Google sign-in signs the shopper in", async () => {
		await driver.executeScript("localStorage.clear()");
		await driver.get(`${FRONTEND_URL}/login`);
		const google = await waitFor(
			driver,
			By.xpath('//button[contains(., "Continue with Google")]')
		);
		await google.click();
		await driver.wait(async () => {
			const token = await driver.executeScript(
				"return localStorage.getItem('token')"
			);
			const url = await driver.getCurrentUrl();
			return Boolean(token) && !url.includes("/login");
		}, 10000);
		const token = await driver.executeScript(
			"return localStorage.getItem('token')"
		);
		assert.ok(token, "expected an auth token in localStorage after OAuth");
	});

	it("signed-in shopper can save a product and see it on the wishlist page", async () => {
		const email = `e2e-wish-ui-${Date.now()}@example.com`;
		const registered = await fetch(`${API_URL}/api/user/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "Wishlist Tester",
				email,
				password: "password123",
			}),
		}).then((r) => r.json());
		assert.equal(registered.success, true);

		const catalog = await (
			await fetch(`${API_URL}/api/product/list`)
		).json();
		const product = catalog.products[0];

		await driver.get(FRONTEND_URL);
		await driver.executeScript(
			"localStorage.setItem('token', arguments[0]); localStorage.setItem('user', arguments[1]);",
			registered.token,
			JSON.stringify(registered.user)
		);

		await driver.get(`${FRONTEND_URL}/product/${product._id}`);
		await waitForText(driver, By.css("body"), product.name);
		const heart = await waitFor(
			driver,
			By.css('button[aria-label="Save to wishlist"]')
		);
		await heart.click();
		await waitForText(driver, By.css("body"), "Saved to wishlist");

		await driver.get(`${FRONTEND_URL}/wishlist`);
		await waitForText(driver, By.css("body"), product.name);
		await waitForText(driver, By.css("body"), "1 saved item");
	});

	it("unknown routes render a friendly 404 page", async () => {
		await driver.get(`${FRONTEND_URL}/this-page-does-not-exist`);
		await waitForText(driver, By.css("body"), "This page went out of style");
		await waitForText(driver, By.css("body"), "BACK HOME");
	});

	it("contains no placeholder lorem ipsum on key pages", async () => {
		for (const path of ["", "/about", "/collection", "/delivery", "/returns", "/privacy", "/terms", "/contact"]) {
			await driver.get(`${FRONTEND_URL}${path}`);
			await driver.sleep(300);
			const text = (await bodyText(driver)).toLowerCase();
			assert.ok(
				!text.includes("lorem ipsum"),
				`page ${path || "/"} still contains lorem ipsum`
			);
		}
	});
});
