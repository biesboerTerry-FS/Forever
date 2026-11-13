import assert from "node:assert/strict";
import { API_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from "../helpers/config.js";

// Backend API tests (plain fetch — no browser). Covers the route surface:
// health, products, auth, cart, orders. Run `npm run seed` first so the
// catalog assertions have data to work with.

async function post(path, body, token) {
	const res = await fetch(`${API_URL}${path}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...(token ? { token } : {}),
		},
		body: JSON.stringify(body || {}),
	});
	return res.json();
}

describe("Backend API", function () {
	this.timeout(30000);

	it("GET / reports the API is up", async () => {
		const res = await fetch(`${API_URL}/`);
		assert.equal(await res.text(), "API working");
	});

	it("GET /api/product/list returns the seeded catalog", async () => {
		const res = await fetch(`${API_URL}/api/product/list`);
		const data = await res.json();
		assert.equal(data.success, true);
		assert.ok(data.products.length > 0, "expected seeded products");
		// Every product needs at least one hosted image URL
		for (const p of data.products) {
			assert.ok(Array.isArray(p.image) && p.image.length >= 1);
			assert.match(p.image[0], /^https?:\/\//);
		}
	});

	it("register -> login -> cart add/get round trip", async () => {
		const email = `e2e-${Date.now()}@example.com`;
		const password = "password123";

		const registered = await post("/api/user/register", {
			name: "E2E User",
			email,
			password,
		});
		assert.equal(registered.success, true);
		assert.ok(registered.token);

		const loggedIn = await post("/api/user/login", { email, password });
		assert.equal(loggedIn.success, true);
		assert.ok(loggedIn.token);
		const token = loggedIn.token;

		const added = await post(
			"/api/cart/add",
			{ itemId: "e2e-item-1", size: "M" },
			token
		);
		assert.equal(added.success, true);

		const cart = await post("/api/cart/get", {}, token);
		assert.equal(cart.success, true);
		assert.equal(cart.cartData["e2e-item-1"]?.M, 1);
	});

	it("rejects an invalid auth token with a JSON error (no hang/crash)", async () => {
		const data = await post("/api/cart/get", {}, "bogus.invalid.token");
		assert.equal(data.success, false);
		assert.ok(data.message);
	});

	it("admin can list orders and update an order status", async () => {
		const admin = await post("/api/user/admin", {
			email: ADMIN_EMAIL,
			password: ADMIN_PASSWORD,
		});
		assert.equal(admin.success, true);
		assert.ok(admin.token);

		const list = await post("/api/order/list", {}, admin.token);
		assert.equal(list.success, true);
		assert.ok(Array.isArray(list.orders));
		// The seed script creates two demo orders.
		assert.ok(list.orders.length >= 1, "expected seeded demo orders");

		const updated = await post(
			"/api/order/status",
			{ orderId: list.orders[0]._id, status: list.orders[0].status },
			admin.token
		);
		assert.equal(updated.success, true);
	});

	it("places a COD order via the API", async () => {
		const email = `e2e-order-${Date.now()}@example.com`;
		const password = "password123";
		const registered = await post("/api/user/register", {
			name: "E2E Order",
			email,
			password,
		});
		const token = registered.token;

		const catalog = await (
			await fetch(`${API_URL}/api/product/list`)
		).json();
		const product = catalog.products[0];

		const placed = await post(
			"/api/order/place",
			{
				// Deliberately send a fake price/amount: the API must ignore them
				// and use the catalogue price plus the delivery fee.
				items: [
					{
						_id: product._id,
						name: "Tampered name",
						price: 1,
						quantity: 1,
						size: "M",
					},
				],
				amount: 1,
				address: {
					firstName: "E2E",
					lastName: "Buyer",
					email,
					street: "1 Test Way",
					city: "Testville",
					state: "TS",
					zipcode: "00000",
					country: "US",
					phone: "5550000000",
				},
			},
			token
		);
		assert.equal(placed.success, true, placed.message);

		const mine = await post("/api/order/userorders", {}, token);
		assert.equal(mine.success, true);
		assert.ok(mine.orders.length >= 1);
		assert.equal(mine.orders[0].paymentMethod, "COD");
		assert.equal(mine.orders[0].amount, product.price + 10);
		assert.equal(mine.orders[0].items[0].name, product.name);
	});

	it("reviews: list seeded reviews, add one, and see the average update", async () => {
		const products = await (
			await fetch(`${API_URL}/api/product/list`)
		).json();
		const productId = products.products[0]._id;

		const before = await (await fetch(`${API_URL}/api/review/${productId}`)).json();
		assert.equal(before.success, true);
		assert.ok(before.count >= 1, "seed should provide sample reviews");
		assert.ok(before.average >= 1 && before.average <= 5);
		assert.equal(before.breakdown.length, 5);

		const email = `e2e-review-${Date.now()}@example.com`;
		const registered = await post("/api/user/register", {
			name: "E2E Reviewer",
			email,
			password: "password123",
		});
		assert.equal(registered.success, true);

		const added = await post(
			"/api/review",
			{
				productId,
				rating: 5,
				title: "E2E review",
				comment: "Added by the automated test suite.",
			},
			registered.token
		);
		assert.equal(added.success, true, added.message);

		// Posting again updates instead of duplicating (one per user/product).
		const updated = await post(
			"/api/review",
			{ productId, rating: 4, comment: "Updated by the test suite." },
			registered.token
		);
		assert.equal(updated.success, true);

		const after = await (await fetch(`${API_URL}/api/review/${productId}`)).json();
		assert.equal(after.count, before.count + 1);
		assert.equal(
			after.reviews.filter((r) => r.userId === String(registered.user.id)).length,
			1
		);
	});

	it("wishlist: toggles a product on and off for the signed-in user", async () => {
		const email = `e2e-wish-${Date.now()}@example.com`;
		const registered = await post("/api/user/register", {
			name: "E2E Wishlist",
			email,
			password: "password123",
		});
		const token = registered.token;
		const products = await (
			await fetch(`${API_URL}/api/product/list`)
		).json();
		const productId = String(products.products[0]._id);

		const saved = await post("/api/wishlist/toggle", { productId }, token);
		assert.equal(saved.success, true);
		assert.equal(saved.added, true);
		assert.ok(saved.wishlist.includes(productId));

		const fetched = await post("/api/wishlist/get", {}, token);
		assert.deepEqual(fetched.wishlist, [productId]);

		const removed = await post("/api/wishlist/toggle", { productId }, token);
		assert.equal(removed.success, true);
		assert.equal(removed.added, false);
		assert.deepEqual(removed.wishlist, []);
	});

	it("admin stats returns dashboard aggregates", async () => {
		const admin = await post("/api/user/admin", {
			email: ADMIN_EMAIL,
			password: ADMIN_PASSWORD,
		});
		const stats = await post("/api/admin/stats", {}, admin.token);
		assert.equal(stats.success, true);
		const s = stats.stats;
		assert.ok(s.products > 0);
		assert.ok(s.orders >= 1);
		assert.ok(s.revenue >= 0);
		assert.equal(s.ordersByStatus.length, 5);
		assert.equal(s.last7Days.length, 7);
		assert.ok(Array.isArray(s.topProducts));
		assert.ok(Array.isArray(s.recentOrders));
	});

	it("demo OAuth signs in a preview Google user", async () => {
		const data = await post("/api/user/oauth/demo", {});
		assert.equal(data.success, true);
		assert.equal(data.demo, true);
		assert.ok(data.token);
		assert.equal(data.user.provider, "google-demo");
		assert.match(data.user.email, /@forever\.test$/);
	});
});
