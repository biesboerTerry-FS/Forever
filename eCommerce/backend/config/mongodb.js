import mongoose from "mongoose";

const connectDB = async () => {
	mongoose.connection.on("connected", () => {
		// executes when connection to DB is established
		console.log("DB Connected");
	});

	await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`);
};

export default connectDB;
