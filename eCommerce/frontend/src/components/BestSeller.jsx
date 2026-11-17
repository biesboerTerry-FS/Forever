import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import ProductSkeleton from "./ProductSkeleton";

const BestSeller = () => {
	const { products, productsLoading } = useContext(ShopContext);
	const [bestSeller, setBestSeller] = useState([]);

	useEffect(() => {
		const bestProduct = products.filter((item) => item.bestseller);
		setBestSeller(bestProduct.slice(0, 5));
	}, [products]);

	return (
		<div className="my-14 sm:my-16">
			<div className="py-8 text-3xl text-center">
				<Title text1={"BEST"} text2={"SELLERS"} />
				<p className="w-full max-w-2xl px-4 m-auto text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
					Customer favorites loved for their fit, comfort, and versatility —
					the staples you’ll reach for again and again.
				</p>
			</div>
			{/* Rendering products */}
			{productsLoading ? (
				<ProductSkeleton count={5} />
			) : (
				<div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-x-6">
					{bestSeller.map((item, index) => (
						<ProductItem
							key={item._id || index}
							id={item._id}
							name={item.name}
							image={item.image}
							price={item.price}
							category={item.category}
							bestseller={item.bestseller}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default BestSeller;
