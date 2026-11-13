// Add Cloudinary transformation parameters so the admin loads small,
// modern-format thumbnails instead of full-size originals.
// Non-Cloudinary URLs pass through unchanged.
export const imageUrl = (src, width = 600) => {
	if (typeof src !== "string" || !src) return src;
	if (!src.includes("res.cloudinary.com") || !src.includes("/image/upload/")) {
		return src;
	}
	if (/\/image\/upload\/(f_|q_|w_|c_)/.test(src)) return src;
	return src.replace(
		"/image/upload/",
		`/image/upload/f_auto,q_auto,w_${width},c_limit/`
	);
};

export const firstImage = (image, width = 600) => {
	const src = Array.isArray(image) ? image[0] : image;
	return imageUrl(src, width);
};
