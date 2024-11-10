import multer from "multer";

// storage configuration
const storage = multer.diskStorage({
	filename: function (request, file, callback) {
		callback(null, file.originalname);
	},
});

const upload = multer({ storage });

export default upload;
