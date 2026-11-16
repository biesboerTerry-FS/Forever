import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { imageUrl } from "../utils/image";

const ProductItem = ({ id, image, name, price }) => {
	const { currency } = useContext(ShopContext);
	const src = imageUrl(Array.isArray(image) ? image[0] : image, 500);

	return (
		<Link
			className="group block text-gray-700 transition-colors cursor-pointer dark:text-gray-200"
			to={`/product/${id}`}
		>
			<div className="overflow-hidden w-full bg-gray-100 border border-transparent aspect-[4/5] dark:bg-gray-900 group-hover:border-gray-200 dark:group-hover:border-gray-800">
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
			</div>
			<p className="pt-3 pb-1 text-sm leading-5 text-gray-800 dark:text-gray-100 line-clamp-2 min-h-[2.75rem]">
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
