// Authenticaters user cart when
import jwt from "jsonwebtoken";

const authUser = async (request, response, next) => {
	const { token } = request.headers;

	if (!token) {
		return response.json({
			success: false,
			message: "Not authorized. Login again",
		});
	}
	try {
		const token_decode = jwt.verify(token, process.env.JWT_SECRET);
		request.body.userId = token_decode.id;
		next();
	} catch (error) {
		console.log(error);
		response({
			success: false,
			message: error.message,
		});
	}
};

export default authUser;
