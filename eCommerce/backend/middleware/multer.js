import multer from "multer";
import crypto from "node:crypto";
import path from "node:path";

// Keep uploads in the OS temp directory (the only writable location on Vercel)
// and give each file a unique name. Files are streamed to Cloudinary by the
// product controller and are not served from disk.
const storage = multer.diskStorage({
	filename: function (request, file, callback) {
		const extension = path.extname(file.originalname).toLowerCase();
		callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
	},
});

const upload = multer({
	storage,
	limits: {
		// Vercel caps request bodies at 4.5 MB, so five files must fit together
		// (5 × 800 KB ≈ 4 MB). The admin compresses images in the browser, so
		// most uploads land far below this ceiling.
		fileSize: 800 * 1024,
		files: 5,
	},
	fileFilter: function (request, file, callback) {
		if (!file.mimetype.startsWith("image/")) {
			return callback(new Error("Only image files can be uploaded."));
		}
		callback(null, true);
	},
});

export default upload;
