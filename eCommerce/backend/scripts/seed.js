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
import employeeModel from "../models/employeeModel.js";
import scheduleModel from "../models/scheduleModel.js";
import learningModel from "../models/learningModel.js";
import payrollModel from "../models/payrollModel.js";

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

	// HR demo data (employees/managers, schedule, learning, payroll)
	await Promise.all([
		employeeModel.deleteMany({}),
		scheduleModel.deleteMany({}),
		learningModel.deleteMany({}),
		payrollModel.deleteMany({}),
	]);

	const employees = await employeeModel.insertMany([
		{ name: "Alex Morgan", email: "alex.manager@forever.test", role: "Store Manager", department: "Retail", status: "Active", phone: "555-0101", hourlyRate: 32, hireDate: now - 400 * 24 * 60 * 60 * 1000, notes: "Oversees store operations and team performance." },
		{ name: "Jordan Lee", email: "jordan.manager@forever.test", role: "Assistant Manager", department: "Retail", status: "Active", phone: "555-0102", hourlyRate: 28, hireDate: now - 320 * 24 * 60 * 60 * 1000, notes: "Supports scheduling and merchandising." },
		// Two demo employees can sign in to the self-service portal at /employee.
		{ name: "Sam Rivera", email: "sam.staff@forever.test", role: "Sales Associate", department: "Retail", status: "Active", phone: "555-0103", address: "412 Birch Lane, Apt 3, Portland, OR 97205", hourlyRate: 20, hireDate: now - 200 * 24 * 60 * 60 * 1000 },
		{ name: "Taylor Kim", email: "taylor.staff@forever.test", role: "Sales Associate", department: "Retail", status: "Active", phone: "555-0104", address: "88 Cedar Street, Portland, OR 97209", hourlyRate: 19, hireDate: now - 150 * 24 * 60 * 60 * 1000 },
		{ name: "Casey Patel", email: "casey.fulfillment@forever.test", role: "Fulfillment Specialist", department: "Operations", status: "Active", phone: "555-0105", hourlyRate: 22, hireDate: now - 180 * 24 * 60 * 60 * 1000 },
		{ name: "Riley Chen", email: "riley.support@forever.test", role: "Customer Support", department: "Support", status: "On Leave", phone: "555-0106", hourlyRate: 21, hireDate: now - 120 * 24 * 60 * 60 * 1000 },
	]);
	console.log(`Inserted ${employees.length} employees.`);

	const fmtDate = (d) => d.toISOString().slice(0, 10);
	const today = new Date();
	const schedules = [];
	for (let i = 0; i < 7; i++) {
		const d = new Date(today);
		d.setDate(today.getDate() + i);
		const date = fmtDate(d);
		const e1 = employees[0], e2 = employees[2], e3 = employees[4];
		schedules.push(
			{ employeeId: String(e1._id), employeeName: e1.name, date, startTime: "09:00", endTime: "17:00", role: "Floor Lead", location: "Store", status: "Scheduled" },
			{ employeeId: String(e2._id), employeeName: e2.name, date, startTime: "10:00", endTime: "18:00", role: "Sales Floor", location: "Store", status: "Scheduled" },
			{ employeeId: String(e3._id), employeeName: e3.name, date, startTime: "08:00", endTime: "16:00", role: "Fulfillment", location: "Back Office", status: "Scheduled" }
		);
	}
	await scheduleModel.insertMany(schedules);
	console.log(`Inserted ${schedules.length} schedule entries.`);

	const due = (days) => { const d = new Date(today); d.setDate(d.getDate() + days); return fmtDate(d); };
	const completed = (daysAgo) => { const d = new Date(today); d.setDate(d.getDate() - daysAgo); return fmtDate(d); };
	await learningModel.insertMany([
		{ employeeId: String(employees[0]._id), employeeName: employees[0].name, course: "Store Leadership Essentials", module: "Coaching & Feedback", status: "Completed", progress: 100, dueDate: due(-10), completedDate: completed(12), score: 96, notes: "Demo record" },
		{ employeeId: String(employees[2]._id), employeeName: employees[2].name, course: "Customer Experience", module: "Returns & Exchanges", status: "In Progress", progress: 60, dueDate: due(5), notes: "Demo record" },
		{ employeeId: String(employees[3]._id), employeeName: employees[3].name, course: "Product Knowledge", module: "New Season Collection", status: "Assigned", progress: 0, dueDate: due(10), notes: "Demo record" },
		{ employeeId: String(employees[4]._id), employeeName: employees[4].name, course: "Inventory & Fulfillment", module: "Pick/Pack Accuracy", status: "Completed", progress: 100, dueDate: due(-3), completedDate: completed(2), score: 92, notes: "Demo record" },
		{ employeeId: String(employees[1]._id), employeeName: employees[1].name, course: "Loss Prevention Basics", module: "Store Safety", status: "Assigned", progress: 0, dueDate: due(14), notes: "Demo record" },
	]);
	console.log("Inserted learning demo records.");

	const periodStart = fmtDate(new Date(today.getFullYear(), today.getMonth(), 1));
	const periodEnd = fmtDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));
	const payrollRows = employees.slice(0, 4).map((e, idx) => {
		const hours = [80, 76, 64, 60][idx];
		const bonus = idx === 0 ? 200 : 0;
		const deductions = [120, 95, 70, 65][idx];
		const gross = hours * e.hourlyRate + bonus;
		const net = gross - deductions;
		return {
			employeeId: String(e._id), employeeName: e.name, periodStart, periodEnd,
			hours, hourlyRate: e.hourlyRate, bonus, deductions, grossPay: gross, netPay: net,
			status: idx < 2 ? "Paid" : "Approved", notes: "Demo payroll record",
		};
	});
	await payrollModel.insertMany(payrollRows);
	console.log(`Inserted ${payrollRows.length} payroll records.`);

	console.log("\nSeed complete ✔");
	console.log(`  Admin login:  ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}  (from backend/.env)`);
	console.log(`  Demo user:    ${DEMO_USER.email} / ${DEMO_USER.password}`);
	process.exit(0);
}

main().catch((error) => {
	console.error("\nSeed failed:", error.message);
	process.exit(1);
});
