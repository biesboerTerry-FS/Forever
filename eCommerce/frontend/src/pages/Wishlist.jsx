import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const Wishlist = () => {
	const { products, wishlist, toggleWishlist, navigate } =
		useContext(ShopContext);

	const items = products.filter((product) =>
		wishlist.includes(String(product._id))
	);

	return (
		<div className="pt-14 border-t">
			<div className="mb-8 text-2xl">
				<Title text1={"MY"} text2={"WISHLIST"} />
			</div>

			{items.length === 0 ? (
				<div className="py-24 text-center text-gray-500 dark:text-gray-400">
					<p className="text-lg font-medium text-gray-700 dark:text-gray-200">
						Your wishlist is empty
					</p>
					<p className="mt-2">
						Tap the heart on any product to save it here for later.
					</p>
					<button
						onClick={() => navigate("/collection")}
						className="px-8 py-3 mt-6 text-sm text-white dark:text-gray-900 bg-black dark:bg-white"
					>
						BROWSE THE COLLECTION
					</button>
				</div>
			) : (
				<>
					<p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
						{items.length} saved {items.length === 1 ? "item" : "items"}
					</p>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 gap-y-8">
						{items.map((item) => (
							<div key={item._id} className="relative">
								<ProductItem
									id={item._id}
									name={item.name}
									image={item.image}
									price={item.price}
								/>
								<button
									onClick={() => toggleWishlist(item._id)}
									title="Remove from wishlist"
									aria-label={`Remove ${item.name} from wishlist`}
									className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-900 border rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="w-4 h-4 text-red-500"
									>
										<path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
									</svg>
								</button>
							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
};

export default Wishlist;
