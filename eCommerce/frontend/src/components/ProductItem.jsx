import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { imageUrl } from "../utils/image";

const ProductItem = ({ id, image, name, price, category, bestseller }) => {
	const { currency } = useContext(ShopContext);
	const src = imageUrl(Array.isArray(image) ? image[0] : image, 500);

	return (
		<Link
			className="group block text-gray-700 transition-colors cursor-pointer dark:text-gray-200"
			to={`/product/${id}`}
		>
			<div className="relative overflow-hidden w-full bg-gray-100 rounded-xl aspect-[4/5] dark:bg-gray-900 shadow-soft transition-all duration-300 group-hover:shadow-elevated group-hover:-translate-y-1">
				<img
					className="block object-cover object-center w-full h-full transition duration-500 ease-out group-hover:scale-105"
					src={src}
					alt={name}
					loading="lazy"
					decoding="async"
					onError={(e) => {
						e.currentTarget.onerror = null;
						e.currentTarget.src =
							"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='20'%3EImage unavailable%3C/text%3E%3C/svg%3E";
					}}
				/>
				{bestseller && (
					<span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-white bg-accent-500 rounded-full">
						Best Seller
					</span>
				)}
				{category && !bestseller && (
					<span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-gray-700 bg-white/90 dark:bg-gray-900/90 dark:text-gray-200 rounded-full border border-gray-200 dark:border-gray-700">
						{category}
					</span>
				)}
				<div className="absolute inset-x-0 bottom-0 flex items-end justify-center p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
					<span className="px-5 py-2.5 text-sm font-semibold text-gray-900 bg-white/95 dark:bg-gray-900/95 dark:text-white rounded-full shadow-elevated">
						View details
					</span>
				</div>
			</div>
			<p className="pt-4 pb-1 text-sm leading-5 text-gray-800 dark:text-gray-100 line-clamp-2 min-h-[2.75rem]">
				{name}
			</p>
			<p className="text-sm font-semibold text-gray-900 dark:text-white">
				{currency}
				{price}
			</p>
		</Link>
	);
};

export default ProductItem;
