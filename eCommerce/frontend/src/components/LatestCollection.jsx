import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const LatestCollection = () => {
	const { products } = useContext(ShopContext);
	const [latestProducts, setLatestProducts] = useState([]);

	useEffect(() => {
		setLatestProducts(products.slice(0, 10));
	}, [products]);

	return (
		<div className="my-14 sm:my-16">
			<div className="py-8 text-3xl text-center sm:py-10">
				<Title text1={"LATEST"} text2={"COLLECTIONS"} />
				<p className="w-full max-w-2xl px-4 m-auto text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
					Fresh arrivals featuring soft fabrics, relaxed fits, and everyday
					essentials designed to mix, match, and wear on repeat.
				</p>
			</div>
			{/* Rendering products */}
			<div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-x-6">
				{latestProducts.map((item, index) => (
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

export default LatestCollection;
