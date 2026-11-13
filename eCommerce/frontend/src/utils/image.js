// Add Cloudinary transformation parameters so the store ships appropriately
// sized, modern-format images instead of the original uploads.
// Non-Cloudinary URLs (offline placeholders, local assets) pass through.
export const imageUrl = (src, width = 600) => {
	if (typeof src !== "string" || !src) return src;
	if (!src.includes("res.cloudinary.com") || !src.includes("/image/upload/")) {
		return src;
	}

	// Already transformed (e.g. saved by an older seed) — leave it alone.
	if (/\/image\/upload\/(f_|q_|w_|c_)/.test(src)) return src;

	return src.replace(
		"/image/upload/",
		`/image/upload/f_auto,q_auto,w_${width},c_limit/`
	);
};

// Product images can be stored either as an array (catalogue) or as a single
// URL (older orders created by the seed script).
export const firstImage = (image, width = 600) => {
	const src = Array.isArray(image) ? image[0] : image;
	return imageUrl(src, width);
};
