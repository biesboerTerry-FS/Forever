import React, { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import { imageUrl } from "../utils/image";
import { addRecentlyViewed } from "../utils/recentlyViewed";
import axios from "axios";
import { toast } from "react-toastify";

// Small helper so ratings render consistently everywhere on the page.
const Stars = ({ value = 0, size = "w-4" }) => (
	<div className="flex items-center gap-1">
		{[1, 2, 3, 4, 5].map((star) => (
			<img
				key={star}
				className={size}
				src={star <= Math.round(value) ? assets.star_icon : assets.star_dull_icon}
				alt=""
			/>
		))}
	</div>
);

const Product = () => {
	const { productId } = useParams();
	const {
		products,
		currency,
		addToCart,
		backendUrl,
		token,
		toggleWishlist,
		isWishlisted,
	} = useContext(ShopContext);
	const [productData, setProductData] = useState(false);
	const [image, setImage] = useState("");
	const [size, setSize] = useState("");

	// Reviews
	const [reviewData, setReviewData] = useState({
		reviews: [],
		average: 0,
		count: 0,
		breakdown: [],
	});
	const [rating, setRating] = useState(5);
	const [hoverRating, setHoverRating] = useState(0);
	const [title, setTitle] = useState("");
	const [comment, setComment] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const fetchProductData = async () => {
		products.map((item) => {
			if (item._id === productId) {
				setProductData(item);
				setImage(item.image[0]);
				return null;
			}
		});
	};

	const fetchReviews = async () => {
		try {
			const response = await axios.get(
				backendUrl + `/api/review/${productId}`
			);
			if (response.data.success) {
				setReviewData({
					reviews: response.data.reviews,
					average: response.data.average,
					count: response.data.count,
					breakdown: response.data.breakdown,
				});
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		fetchProductData();
	}, [productId, products]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (productId) fetchReviews();
	}, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

	// Basic per-product SEO: title, description and Product structured data.
	useEffect(() => {
		if (!productData) return;

		addRecentlyViewed(productData._id);

		const previousTitle = document.title;
		document.title = `${productData.name} | Forever`;

		const description = (productData.description || "").slice(0, 160);
		let meta = document.querySelector('meta[name="description"]');
		const previousDescription = meta?.getAttribute("content") || "";
		if (!meta) {
			meta = document.createElement("meta");
			meta.setAttribute("name", "description");
			document.head.appendChild(meta);
		}
		meta.setAttribute("content", description);

		const script = document.createElement("script");
		script.type = "application/ld+json";
		script.id = "product-jsonld";
		script.textContent = JSON.stringify({
			"@context": "https://schema.org",
			"@type": "Product",
			name: productData.name,
			description: productData.description,
			image: productData.image,
			offers: {
				"@type": "Offer",
				price: productData.price,
				priceCurrency: "USD",
				availability: "https://schema.org/InStock",
			},
			...(reviewData.count > 0
				? {
						aggregateRating: {
							"@type": "AggregateRating",
							ratingValue: reviewData.average,
							reviewCount: reviewData.count,
						},
				  }
				: {}),
		});
		document.head.appendChild(script);

		return () => {
			document.title = previousTitle;
			meta?.setAttribute("content", previousDescription);
			script.remove();
		};
	}, [productData, reviewData.average, reviewData.count]);

	const submitReview = async (event) => {
		event.preventDefault();
		if (!token) {
			toast.info("Please log in to write a review");
			return;
		}
		if (!comment.trim()) {
			toast.error("Please add a comment");
			return;
		}
		try {
			setSubmitting(true);
			const response = await axios.post(
				backendUrl + "/api/review",
				{ productId, rating, title, comment },
				{ headers: { token } }
			);
			if (response.data.success) {
				toast.success(response.data.message);
				setTitle("");
				setComment("");
				setRating(5);
				await fetchReviews();
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		} finally {
			setSubmitting(false);
		}
	};

	const saved = productData && isWishlisted(productData._id);

	return productData ? (
		<div className="pt-10 transition-opacity duration-500 ease-in border-t-2 opacity-100">
			{/* Product Data */}
			<div className="flex flex-col gap-12 sm:gap-12 sm:flex-row">
				{/* Product Image */}
				<div className="flex flex-col-reverse flex-1 gap-3 sm:flex-row">
					<div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
						{productData.image.map((item, index) => (
							<button
								type="button"
								key={index}
								onClick={() => setImage(item)}
								aria-label={`View image ${index + 1} of ${productData.name}`}
								className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0"
							>
								<img
									src={imageUrl(item, 200)}
									className="w-full cursor-pointer"
									alt=""
									loading="lazy"
									decoding="async"
								/>
							</button>
						))}
					</div>
					<div className="w-full sm:w-[80%]">
						<img
							className="w-full h-auto"
							src={imageUrl(image, 900)}
							alt={productData.name}
							fetchPriority="high"
							decoding="async"
							onError={(e) => {
								e.currentTarget.onerror = null;
								e.currentTarget.src =
									"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1000'%3E%3Crect width='800' height='1000' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='28'%3EImage unavailable%3C/text%3E%3C/svg%3E";
							}}
						/>
					</div>
				</div>

				{/* Product info */}
				<div className="flex-1">
					<div className="flex items-start justify-between gap-3">
						<h1 className="mt-2 text-2xl font-medium">{productData.name}</h1>
						<button
							onClick={() => toggleWishlist(productData._id)}
							aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
							title={saved ? "Remove from wishlist" : "Save to wishlist"}
							className="flex items-center justify-center flex-shrink-0 w-10 h-10 border rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill={saved ? "currentColor" : "none"}
								stroke="currentColor"
								strokeWidth="1.6"
								className={`w-5 h-5 ${saved ? "text-red-500" : "text-gray-700 dark:text-gray-200"}`}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
								/>
							</svg>
						</button>
					</div>
					<div className="flex items-center gap-2 mt-2">
						<Stars value={reviewData.average} />
						<a href="#reviews" className="pl-1 text-sm text-gray-600 dark:text-gray-300 underline">
							{reviewData.count === 0
								? "No reviews yet"
								: `${reviewData.average} · ${reviewData.count} ${
										reviewData.count === 1 ? "review" : "reviews"
								  }`}
						</a>
					</div>
					<p className="mt-5 text-3xl font-medium">
						{currency}
						{productData.price}
					</p>
					<p className="mt-5 text-gray-500 dark:text-gray-400 md:w-4/5">
						{productData.description}
					</p>
					<div className="flex flex-col gap-4 my-8">
						<p>Select Size</p>
						<div className="flex gap-2">
							{productData.sizes.map((item, index) => (
								<button
									type="button"
									onClick={() => setSize(item)}
									aria-pressed={item === size}
									className={`border py-2 px-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 dark:focus-visible:ring-offset-gray-950 ${
										item === size
											? "border-orange-500 bg-orange-50 text-gray-900 dark:bg-orange-500/20 dark:text-white dark:border-orange-400"
											: "border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:active:bg-gray-600"
									}`}
									key={index}
								>
									{item}
								</button>
							))}
						</div>
					</div>
					<button
						type="button"
						onClick={() => addToCart(productData._id, size)}
						className="px-8 py-3 text-sm text-white bg-black transition-colors hover:bg-gray-800 active:bg-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:text-gray-900 dark:bg-white dark:hover:bg-gray-200 dark:active:bg-gray-300 dark:focus-visible:ring-white dark:focus-visible:ring-offset-gray-950"
					>
						ADD TO CART
					</button>
					<hr className="mt-8 sm:w-4/5" />
					<div className="flex flex-col gap-1 mt-5 text-sm text-gray-500 dark:text-gray-400">
						<p>100% Original product.</p>
						<p>Cash on delivery is available on this product.</p>
						<p>Easy return and exchange policy within 7 days.</p>
					</div>
				</div>
			</div>

			{/* Description and Review sections*/}
			<div className="mt-20">
				<div className="flex">
					<b className="px-5 py-3 text-sm border">Description</b>
					<p className="px-5 py-3 text-sm border">
						Reviews ({reviewData.count})
					</p>
				</div>
				<div className="flex flex-col gap-4 px-6 py-6 text-sm text-gray-600 dark:text-gray-300 border">
					<p>{productData.description}</p>
					<p>
						<b className="text-gray-800 dark:text-gray-100">Fit &amp; feel:</b> True to size
						with an easy, comfortable cut. If you're between sizes, we
						recommend sizing up for a more relaxed fit.
					</p>
					<p>
						<b className="text-gray-800 dark:text-gray-100">Care:</b> Machine wash cold with
						like colours, tumble dry low and warm iron if needed. Do not
						bleach.
					</p>
					<p>
						<b className="text-gray-800 dark:text-gray-100">Delivery &amp; returns:</b> Ships
						within one business day. Free exchanges and returns within 7
						days of delivery — see our{" "}
						<Link to="/delivery" className="underline">
							delivery
						</Link>{" "}
						and{" "}
						<Link to="/returns" className="underline">
							returns
						</Link>{" "}
						pages for details.
					</p>
				</div>
			</div>

			{/* Reviews */}
			<div id="reviews" className="mt-16">
				<h2 className="mb-6 text-xl font-medium text-gray-800 dark:text-gray-100">
					Customer Reviews
				</h2>

				<div className="flex flex-col gap-10 md:flex-row">
					{/* Summary + form */}
					<div className="md:w-1/3">
						<div className="p-6 border">
							<div className="flex items-end gap-3">
								<p className="text-5xl font-semibold text-gray-800 dark:text-gray-100">
									{reviewData.count === 0 ? "—" : reviewData.average}
								</p>
								<div className="pb-1">
									<Stars value={reviewData.average} />
									<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
										Based on {reviewData.count}{" "}
										{reviewData.count === 1 ? "review" : "reviews"}
									</p>
								</div>
							</div>

							<div className="flex flex-col gap-1 mt-4">
								{reviewData.breakdown.map(({ star, count }) => {
									const percent =
										reviewData.count === 0
											? 0
											: (count / reviewData.count) * 100;
									return (
										<div
											key={star}
											className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
										>
											<span className="w-8">{star} star</span>
											<div className="flex-1 h-2 overflow-hidden bg-gray-200 dark:bg-gray-700 rounded">
												<div
													className="h-full bg-black dark:bg-white"
													style={{ width: `${percent}%` }}
												/>
											</div>
											<span className="w-6 text-right">{count}</span>
										</div>
									);
								})}
							</div>
						</div>

						<form
							onSubmit={submitReview}
							className="flex flex-col gap-3 p-6 mt-6 border"
						>
							<p className="font-medium text-gray-800 dark:text-gray-100">Write a review</p>
							{!token && (
								<p className="text-xs text-gray-500 dark:text-gray-400">
									<Link to="/login" className="underline">
										Log in
									</Link>{" "}
									to share your experience.
								</p>
							)}
							<div className="flex items-center gap-1">
								{[1, 2, 3, 4, 5].map((star) => (
									<button
										key={star}
										type="button"
										onMouseEnter={() => setHoverRating(star)}
										onMouseLeave={() => setHoverRating(0)}
										onClick={() => setRating(star)}
										aria-label={`${star} star`}
									>
										<img
											className="w-6"
											src={
												star <= (hoverRating || rating)
													? assets.star_icon
													: assets.star_dull_icon
											}
											alt=""
										/>
									</button>
								))}
							</div>
							<input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Review title (optional)"
								aria-label="Review title (optional)"
								className="px-3 py-2 text-sm border outline-none"
							/>
							<textarea
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								placeholder="What did you like or dislike?"
								aria-label="Your review"
								rows={4}
								className="px-3 py-2 text-sm border outline-none resize-none"
								required
							/>
							<button
								type="submit"
								disabled={submitting || !token}
								className="py-2 text-sm text-white dark:text-gray-900 bg-black dark:bg-white disabled:opacity-50"
							>
								{submitting ? "SUBMITTING…" : "SUBMIT REVIEW"}
							</button>
						</form>
					</div>

					{/* Review list */}
					<div className="flex-1">
						{reviewData.reviews.length === 0 ? (
							<p className="py-10 text-sm text-gray-500 dark:text-gray-400">
								No reviews yet — be the first to review this product.
							</p>
						) : (
							<div className="flex flex-col gap-5">
								{reviewData.reviews.map((review) => (
									<div
										key={review._id}
										className="pb-5 border-b last:border-none"
									>
										<div className="flex items-center justify-between gap-3">
											<div>
												<p className="font-medium text-gray-800 dark:text-gray-100">
													{review.title || "Verified purchase"}
												</p>
												<div className="flex items-center gap-2 mt-1">
													<Stars value={review.rating} size="w-3.5" />
													<span className="text-xs text-gray-500 dark:text-gray-400">
														{review.name}
													</span>
												</div>
											</div>
											<p className="text-xs text-gray-400 dark:text-gray-500">
												{new Date(review.date).toLocaleDateString(
													undefined,
													{ year: "numeric", month: "short", day: "numeric" }
												)}
											</p>
										</div>
										<p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
											{review.comment}
										</p>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Display related products */}
			<RelatedProducts
				category={productData.category}
				subCategory={productData.subCategory}
			/>
		</div>
	) : (
		<div className="opacity-0"></div>
	);
};

export default Product;
