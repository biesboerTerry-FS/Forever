import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import wishlistRouter from "./routes/wishlistRoute.js";
import adminRouter from "./routes/adminRoute.js";
import newsletterRouter from "./routes/newsletterRoute.js";

const app = express();

// Vercel terminates TLS in front of the function; trust its proxy headers so
// rate limiting sees the real client IP.
app.set("trust proxy", 1);
app.disable("x-powered-by");

//^ Middlewares
app.use(helmet());

// Allow the local dev apps, Vercel preview/production deployments and any
// explicitly configured custom domains.
const configuredOrigins = (process.env.CORS_ORIGINS || "")
	.split(",")
	.map((origin) => origin.trim().replace(/\/$/, ""))
	.filter(Boolean);

const isAllowedOrigin = (origin) => {
	if (!origin) return true; // curl, mobile apps, server-to-server
	const clean = origin.replace(/\/$/, "");
	if (configuredOrigins.includes(clean)) return true;
	if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(clean)) return true;
	if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(clean)) return true;
	return false;
};

app.use(
	cors({
		origin(origin, callback) {
			callback(null, isAllowedOrigin(origin));
		},
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "token", "stripe-signature", "x-razorpay-signature"],
	})
);

// Keep the raw body around so payment webhooks can verify signatures.
app.use(
	express.json({
		limit: "1mb",
		verify: (request, response, buffer) => {
			request.rawBody = buffer;
		},
	})
);

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 500,
	standardHeaders: true,
	legacyHeaders: false,
	message: { success: false, message: "Too many requests. Please try again shortly." },
});

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 60,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many attempts. Please wait a few minutes and try again.",
	},
});

app.use("/api", apiLimiter);

app.get("/", (request, response) => {
	response.send("API working");
});

// Ensure the database is connected before handling API requests. In serverless
// environments, requests may arrive on cold starts or after the connection drops.
app.use("/api", async (request, response, next) => {
	if (request.path === "/health") return next();
	try {
		await connectDB();
		next();
	} catch (error) {
		console.error("Database unavailable:", error.message);
		response.status(503).json({
			success: false,
			message: "Database connection unavailable. Please try again shortly.",
		});
	}
});

app.get("/api/health", async (request, response) => {
	try {
		await connectDB();
		response.json({ success: true, status: "ok" });
	} catch (error) {
		response.status(503).json({ success: false, status: "db-unavailable" });
	}
});

//^ API endpoints
app.use("/api/user", authLimiter, userRouter);
app.use("/api/newsletter", authLimiter, newsletterRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/review", reviewRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/admin", adminRouter);

// Connect once per cold start as an optimization; request middleware above is the
// source of truth for readiness.
connectDB().catch(() => {});
connectCloudinary();

// On Vercel the app is invoked as a serverless handler. Only start a listener
// when running as a normal long-lived Node process (local dev / self-hosting).
const port = process.env.PORT || 4001;
if (!process.env.VERCEL) {
	app.listen(port, () => console.log(`Server started on PORT: ${port}`));
}

export default app;
