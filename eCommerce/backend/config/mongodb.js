import mongoose from "mongoose";

// Reuse a single connection across warm serverless invocations. Without this,
// every cold start would open a new pool and can exhaust the Atlas connection
// limit.
let connectionPromise = null;

const connectDB = async () => {
	if (!process.env.MONGODB_URI) {
		throw new Error("MONGODB_URI is not configured");
	}

	if (mongoose.connection.readyState === 1) return mongoose.connection;

	if (!connectionPromise) {
		mongoose.connection.on("connected", () => console.log("DB Connected"));
		mongoose.connection.on("error", (err) =>
			console.error("DB connection error:", err.message)
		);

		connectionPromise = mongoose
			.connect(process.env.MONGODB_URI, {
				// Keep this under the Vercel function timeout so a bad URI fails
				// fast instead of hanging until the platform kills the request.
				serverSelectionTimeoutMS: 5000,
				// The app always uses its own database, even when the connection
				// string points at a cluster without a database name.
				dbName: "e-commerce",
			})
			.catch((error) => {
				connectionPromise = null;
				console.error("DB connect failed:", error.message);
				throw error;
			});
	}

	return connectionPromise;
};

export default connectDB;
