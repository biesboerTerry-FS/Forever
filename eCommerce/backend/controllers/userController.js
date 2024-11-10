import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const createToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET);
};

//& Route for user login
const loginUser = async (request, response) => {
	// verify endpoints are working
	try {
		const { email, password } = request.body;

		const user = await userModel.findOne({ email });

		if (!user) {
			return response.json({
				success: false,
				message: "User does not exist",
			});
		}

		// compares if user-entered password matches password in database
		const isMatch = await bcrypt.compare(password, user.password);

		if (isMatch) {
			// if matches this then sends token to the userSelect:
			const token = createToken(user._id);
			response.json({
				success: true,
				token,
			});
		} else {
			response.json({
				success: false,
				message: "Invalid credentials",
			});
		}
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

//& Route for user registration
const resgisterUser = async (request, response) => {
	// verify endpoints are working
	try {
		const { name, email, password } = request.body;
		// checking if user already exists or not
		const exists = await userModel.findOne({ email });
		if (exists) {
			return response.json({
				success: false,
				message: "User already exists",
			});
		}

		// validating email format and strong password
		if (!validator.isEmail(email)) {
			return response.json({
				success: false,
				message: "Please enter a valid email",
			});
		}
		if (password.length < 8) {
			return response.json({
				success: false,
				message: "Password must contain at least 8 characters",
			});
		}

		// hashing user password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const newUser = new userModel({
			name,
			email,
			password: hashedPassword,
		});

		const user = await newUser.save();

		const token = createToken(user._id);

		response.json({
			success: true,
			token,
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// Route for admin login
const adminLogin = async (request, response) => {
	// verify endpoints are working
	try {
		const { email, password } = request.body;
		if (
			email === process.env.ADMIN_EMAIL &&
			password === process.env.ADMIN_PASSWORD
		) {
			const token = jwt.sign(email + password, process.env.JWT_SECRET);
			response.json({
				success: true,
				token,
			});
		} else {
			response.json({
				success: false,
				message: "Invalid credentials",
			});
		}
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

export { loginUser, resgisterUser, adminLogin };
