import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { getRecentlyViewed } from "../utils/recentlyViewed";
import Title from "./Title";
import ProductItem from "./ProductItem";
import ProductSkeleton from "./ProductSkeleton";

const RecentlyViewed = () => {
	const { products, productsLoading } = useContext(ShopContext);
	const [recent, setRecent] = useState([]);

	useEffect(() => {
		const viewedIds = getRecentlyViewed();
		if (!viewedIds.length || !products.length) {
			setRecent([]);
			return;
		}
		const map = new Map(products.map((p) => [p._id, p]));
		const items = viewedIds
			.map((id) => map.get(id))
			.filter(Boolean)
			.slice(0, 5);
		setRecent(items);
	}, [products]);

	if (productsLoading) {
		return (
			<div className="my-14 sm:my-16">
				<div className="py-8 text-3xl text-center sm:py-10">
					<Title text1={"RECENTLY"} text2={"VIEWED"} />
				</div>
				<ProductSkeleton count={5} />
			</div>
		);
	}

	if (recent.length === 0) return null;

	return (
		<div className="my-14 sm:my-16">
			<div className="py-8 text-3xl text-center sm:py-10">
				<Title text1={"RECENTLY"} text2={"VIEWED"} />
				<p className="w-full max-w-2xl px-4 m-auto text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
					Pick up where you left off.
				</p>
			</div>
			<div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-x-6">
				{recent.map((item, index) => (
					<ProductItem
						key={item._id || index}
						id={item._id}
						image={item.image}
						name={item.name}
						price={item.price}
						category={item.category}
						bestseller={item.bestseller}
					/>
				))}
			</div>
		</div>
	);
};

export default RecentlyViewed;
