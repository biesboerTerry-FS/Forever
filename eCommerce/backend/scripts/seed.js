// Seed the database with the store catalog, a demo user and demo orders.
//
// Usage:
//   node scripts/seed.js          # uploads product images to Cloudinary, then inserts everything
//   SEED_OFFLINE=1 node scripts/seed.js   # skips uploads, uses picsum.photos placeholder URLs (fast, no Cloudinary needed)
//
// What it does:
//   1. Reads the product catalog from ../../frontend/src/assets/assets.js (single source of truth)
//   2. Uploads each product image to Cloudinary (or uses placeholders in offline mode)
//   3. Wipes and re-inserts ALL products, ALL orders, and creates the demo user:
//        email:    demo@forever.test
//        password: demo1234
//   4. Creates two demo orders for the demo user (COD + Stripe) so the Orders pages are not empty.
//
// WARNING: this deletes existing products and orders in the target database.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "../config/mongodb.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import reviewModel from "../models/reviewModel.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const OFFLINE = process.env.SEED_OFFLINE === "1";
const CONCURRENCY = 3;

const ASSETS_DIR = path.resolve(
	__dirname,
	"../../frontend/src/assets"
);
const ASSETS_FILE = path.join(ASSETS_DIR, "assets.js");

const DEMO_USER = {
	name: "Demo User",
	email: "demo@forever.test",
	password: "demo1234",
};

const DEMO_ADDRESS = {
	firstName: "Demo",
	lastName: "User",
	email: DEMO_USER.email,
	street: "221B Baker Street",
	city: "London",
	state: "Greater London",
	zipcode: "NW1 6XE",
	country: "United Kingdom",
	phone: "5551234567",
};

// ---------------------------------------------------------------------------
// Load catalog from backend/seed-products.json if present (preferred for
// portfolio/demo seeding with remote image URLs), otherwise read the product
// catalog out of the frontend assets file (which also has Vite-specific
// `import x from "./p_img1.png"` lines).
// ---------------------------------------------------------------------------
function loadCatalog() {
	const jsonCatalog = path.resolve(__dirname, "../seed-products.json");
	if (fs.existsSync(jsonCatalog)) {
		const data = JSON.parse(fs.readFileSync(jsonCatalog, "utf8"));
		const products = Array.isArray(data) ? data : data.products;
		if (!Array.isArray(products)) {
			throw new Error("seed-products.json must contain a products array");
		}
		return products;
	}

	const src = fs.readFileSync(ASSETS_FILE, "utf8");

	const importMap = {};
	const importRe = /import\s+(\w+)\s+from\s+"\.\/([^"]+)"\s*;/g;
	let match;
	while ((match = importRe.exec(src)) !== null) {
		importMap[match[1]] = match[2];
	}

	const marker = "export const products =";
	const arrStart = src.indexOf("[", src.indexOf(marker));
	const arrEnd = src.lastIndexOf("]");
	const arrayExpr = src.slice(arrStart, arrEnd + 1);

	const names = Object.keys(importMap);
	const values = names.map((n) => importMap[n]);
	const products = new Function(...names, `return ${arrayExpr};`)(...values);
	return products;
}

// Real product copy, generated per category instead of placeholder text.
const DETAILS = {
	Topwear:
		"Made from soft, breathable cotton with a smooth hand-feel and a shape that holds wash after wash.",
	Bottomwear:
		"Cut from durable, slightly stretchy fabric with a reinforced waistband for all-day comfort.",
	Winterwear:
		"Lined and insulated for warmth without bulk, with a smooth interior that layers easily.",
};
const CARE = {
	Topwear: "Machine wash cold, tumble dry low, warm iron if needed.",
	Bottomwear: "Machine wash cold, hang to dry, warm iron if needed.",
	Winterwear: "Dry clean or hand wash cold; do not tumble dry.",
};

function buildDescription(item) {
	const detail = DETAILS[item.subCategory] || DETAILS.Topwear;
	const care = CARE[item.subCategory] || CARE.Topwear;
	return `${item.name} is an everyday favourite from our ${item.category} ${item.subCategory.toLowerCase()} range. ${detail} ${care}`;
}

// ---------------------------------------------------------------------------
// Resolve one image: keep http(s) URLs as-is, or upload local asset filenames
// to Cloudinary. Falls back to a placeholder URL so a bad key/network issue
// can never abort the whole seed.
// ---------------------------------------------------------------------------
async function uploadImage(imageRef) {
	if (typeof imageRef === "string" && /^https?:\/\//i.test(imageRef)) {
		return imageRef;
	}

	const filename = String(imageRef);
	if (OFFLINE) {
		return `https://picsum.photos/seed/${encodeURIComponent(filename)}/600/800`;
	}

	const filePath = path.join(ASSETS_DIR, filename);
	try {
		const result = await cloudinary.uploader.upload(filePath, {
			resource_type: "image",
			folder: "forever-seed",
		});
		return result.secure_url;
	} catch (error) {
		console.warn(
			`  ! upload failed for ${filename} (${error.message}), using placeholder`
		);
		return `https://picsum.photos/seed/${encodeURIComponent(filename)}/600/800`;
	}
}

// Tiny async pool so we never blast Cloudinary with 55 parallel uploads.
async function mapPool(items, fn, concurrency) {
	const results = new Array(items.length);
	let next = 0;
	async function worker() {
		while (next < items.length) {
			const i = next++;
			results[i] = await fn(items[i], i);
		}
	}
	await Promise.all(
		Array.from({ length: Math.min(concurrency, items.length) }, worker)
	);
	return results;
}

async function main() {
	console.log("Forever — database seed");
	console.log(`Mode: ${OFFLINE ? "offline (placeholder images)" : "online (Cloudinary uploads)"}`);

	const catalog = loadCatalog();
	console.log(`Catalog entries found: ${catalog.length}`);

	await connectDB();

	// Cloudinary config (same env vars as config/cloudinary.js)
	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_SECRET_KEY,
	});

	// Upload images and build product documents. Re-use image URLs from a
	// previous seed when the same product is already in the database, so
	// re-seeding doesn't upload duplicates to Cloudinary.
	const existing = await productModel
		.find({}, { name: 1, image: 1, date: 1 })
		.lean();
	const imageCache = new Map(
		existing.map((p) => [`${p.name}__${p.date}`, p.image])
	);
	let reused = 0;

	let uploadsDone = 0;
	const products = await mapPool(catalog, async (item) => {
		const cacheKey = `${item.name}__${item.date}`;
		let images;

		const allRemote = Array.isArray(item.image) && item.image.every((img) => typeof img === "string" && /^https?:\/\//i.test(img));
		if (!OFFLINE && imageCache.has(cacheKey)) {
			images = imageCache.get(cacheKey);
			reused += 1;
		} else {
			images = await Promise.all(
				item.image.map(async (imageRef) => {
					const url = await uploadImage(imageRef);
					if (!(typeof imageRef === "string" && /^https?:\/\//i.test(imageRef))) {
						uploadsDone += 1;
						if (uploadsDone % 10 === 0) {
							console.log(`  uploaded ${uploadsDone} images...`);
						}
					}
					return url;
				})
			);
		}
		if (allRemote) {
			images = item.image;
		}

		return {
			name: item.name,
			description: buildDescription(item),
			price: item.price,
			category: item.category,
			subCategory: item.subCategory,
			sizes: item.sizes,
			bestseller: item.bestseller,
			image: images,
			date: item.date,
		};
	}, CONCURRENCY);

	if (reused > 0) {
		console.log(`Re-used existing images for ${reused} products.`);
	}
	if (uploadsDone > 0) {
		console.log(`Processed ${uploadsDone} local image uploads.`);
	}

	console.log("Wiping products and orders...");
	await productModel.deleteMany({});
	await orderModel.deleteMany({});

	const inserted = await productModel.insertMany(products);
	const [first, second] = inserted;
	console.log(`Inserted ${inserted.length} products.`);

	// Demo user (upsert — safe to re-run)
	const hashedPassword = await bcrypt.hash(DEMO_USER.password, 10);
	const demoUser = await userModel.findOneAndUpdate(
		{ email: DEMO_USER.email },
		{ name: DEMO_USER.name, email: DEMO_USER.email, password: hashedPassword },
		{ upsert: true, new: true }
	);
	console.log(`Demo user: ${demoUser.email} / ${DEMO_USER.password}`);

	const now = Date.now();
	const makeItems = (p, qty, size) => ({
		name: p.name,
		price: p.price,
		quantity: qty,
		size,
		image: p.image[0],
	});

	const demoOrders = [
		{
			userId: demoUser._id.toString(),
			items: [makeItems(first, 1, "M")],
			amount: first.price + 10,
			address: DEMO_ADDRESS,
			status: "Delivered",
			paymentMethod: "COD",
			payment: false,
			date: now - 3 * 24 * 60 * 60 * 1000,
		},
		{
			userId: demoUser._id.toString(),
			items: [makeItems(second, 2, "L")],
			amount: second.price * 2 + 10,
			address: DEMO_ADDRESS,
			status: "Order Placed",
			paymentMethod: "Stripe",
			payment: true,
			date: now - 5 * 60 * 60 * 1000,
		},
	];
	await orderModel.insertMany(demoOrders);
	console.log(`Inserted ${demoOrders.length} demo orders.`);

	// Sample reviews so product pages have ratings out of the box.
	await reviewModel.deleteMany({});
	const reviewSeedData = [
		{
			productId: first._id,
			name: "Ava Thompson",
			rating: 5,
			title: "Beautiful quality",
			comment:
				"Fabric feels premium and the fit is exactly as described. It has already become one of my most-worn pieces.",
		},
		{
			productId: first._id,
			name: "Mia Chen",
			rating: 4,
			title: "Great everyday top",
			comment:
				"Lovely soft cotton and true to size. I took off one star only because I wish it came in more colours.",
		},
		{
			productId: first._id,
			name: "Sofia Rossi",
			rating: 5,
			title: "Will buy again",
			comment:
				"Washed it several times and it still holds its shape. Delivery was quick too.",
		},
		{
			productId: second._id,
			name: "James Walker",
			rating: 5,
			title: "Perfect fit",
			comment:
				"Really comfortable and the quality is better than I expected for the price. Sizing is accurate.",
		},
		{
			productId: second._id,
			name: "Noah Patel",
			rating: 4,
			title: "Solid staple",
			comment:
				"Good weight cotton and a clean cut. Works well on its own or layered.",
		},
		{
			productId: inserted[2]._id,
			name: "Isla Morgan",
			rating: 5,
			title: "Lovely for my daughter",
			comment:
				"Soft, well made and easy to wash. She loves it and wants another one already.",
		},
	];

	const reviews = reviewSeedData.map((review, index) => ({
		...review,
		productId: String(review.productId),
		userId: `seed-reviewer-${index}`,
		date: Date.now() - (index + 1) * 24 * 60 * 60 * 1000,
	}));
	await reviewModel.insertMany(reviews);
	console.log(`Inserted ${reviews.length} sample reviews.`);

	console.log("\nSeed complete ✔");
	console.log(`  Admin login:  ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}  (from backend/.env)`);
	console.log(`  Demo user:    ${DEMO_USER.email} / ${DEMO_USER.password}`);
	process.exit(0);
}

main().catch((error) => {
	console.error("\nSeed failed:", error.message);
	process.exit(1);
});
