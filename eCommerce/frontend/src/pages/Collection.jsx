import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const Collection = () => {
	const { products, search, setSearch } = useContext(ShopContext);
	const [showFilter, setShowFilter] = useState(false);
	const [filterProducts, setFilterProducts] = useState([]);
	const [category, setCategory] = useState([]);
	const [subCategory, setSubCategory] = useState([]);
	const [sortType, setSortType] = useState("relavent");
	const [visibleCount, setVisibleCount] = useState(24);

	const PAGE_SIZE = 24;
	const visibleProducts = filterProducts.slice(0, visibleCount);
	const hasMore = visibleCount < filterProducts.length;

	const toggleCategory = (event) => {
		if (category.includes(event.target.value)) {
			setCategory((prev) =>
				prev.filter((item) => item !== event.target.value)
			);
		} else {
			setCategory((prev) => [...prev, event.target.value]);
		}
	};

	const toggleSubCategory = (event) => {
		if (subCategory.includes(event.target.value)) {
			setSubCategory((prev) =>
				prev.filter((item) => item !== event.target.value)
			);
		} else {
			setSubCategory((prev) => [...prev, event.target.value]);
		}
	};

	const applyFilter = () => {
		let productsCopy = products.slice();

		// Search matches product name, category, sub-category and description
		// so "men", "winter" and "jacket" all work as people expect.
		const term = search.trim().toLowerCase();
		if (term) {
			productsCopy = productsCopy.filter((item) =>
				[item.name, item.category, item.subCategory, item.description]
					.join(" ")
					.toLowerCase()
					.includes(term)
			);
		}

		if (category.length > 0) {
			productsCopy = productsCopy.filter((item) =>
				category.includes(item.category)
			);
		}
		if (subCategory.length > 0) {
			productsCopy = productsCopy.filter((item) =>
				subCategory.includes(item.subCategory)
			);
		}

		setFilterProducts(productsCopy);
	};

	const sortProduct = () => {
		let filterProductCopy = filterProducts.slice();

		switch (sortType) {
			case "low-high":
				setFilterProducts(
					filterProductCopy.sort((a, b) => a.price - b.price)
				);
				break;

			case "high-low":
				setFilterProducts(
					filterProductCopy.sort((a, b) => b.price - a.price)
				);
				break;

			default:
				applyFilter();
				break;
		}
	};

	useEffect(() => {
		applyFilter();
	}, [category, subCategory, search, products]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		sortProduct();
	}, [sortType]); // eslint-disable-line react-hooks/exhaustive-deps

	// Start each new result set at the first page.
	useEffect(() => {
		setVisibleCount(PAGE_SIZE);
	}, [category, subCategory, search, sortType, products]);

	return (
		<div className="flex flex-col pt-10 border-t sm:flex-row sm:gap-10">
			{/* Filter options */}
			<div className="min-w-60">
				<button
					type="button"
					onClick={() => setShowFilter(!showFilter)}
					aria-expanded={showFilter}
					className="flex items-center gap-2 my-2 text-xl cursor-pointer"
				>
					FILTERS
					<img
						className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
						src={assets.dropdown_icon}
						alt=""
					/>
				</button>

				{/* category filter */}
				<div
					className={`border border-gray-300 dark:border-gray-700 pl-5 py-3 mt-6 ${
						showFilter ? "" : "hidden"
					} sm:block`}
				>
					<p className="mb-3 text-sm font-medium">CATEGORIES</p>
					<div className="flex flex-col gap-2 text-sm font-light text-gray-700 dark:text-gray-200">
						<label className="flex gap-2 cursor-pointer">
							<input
								className="w-3"
								type="checkbox"
								value={"Men"}
								onChange={toggleCategory}
							/>
							Men
						</label>
						<label className="flex gap-2 cursor-pointer">
							<input
								className="w-3"
								type="checkbox"
								value={"Women"}
								onChange={toggleCategory}
							/>
							Women
						</label>
						<label className="flex gap-2 cursor-pointer">
							<input
								className="w-3"
								type="checkbox"
								value={"Kids"}
								onChange={toggleCategory}
							/>
							Kids
						</label>
					</div>
				</div>

				{/* Subcategory filter */}
				<div
					className={`border border-gray-300 dark:border-gray-700 pl-5 py-3 my-5 ${
						showFilter ? "" : "hidden"
					} sm:block`}
				>
					<p className="mb-3 text-sm font-medium">TYPE</p>
					<div className="flex flex-col gap-2 text-sm font-light text-gray-700 dark:text-gray-200">
						<label className="flex gap-2 cursor-pointer">
							<input
								className="w-3"
								type="checkbox"
								value={"Topwear"}
								onChange={toggleSubCategory}
							/>
							Topwear
						</label>
						<label className="flex gap-2 cursor-pointer">
							<input
								className="w-3"
								type="checkbox"
								value={"Bottomwear"}
								onChange={toggleSubCategory}
							/>
							Bottomwear
						</label>
						<label className="flex gap-2 cursor-pointer">
							<input
								className="w-3"
								type="checkbox"
								value={"Winterwear"}
								onChange={toggleSubCategory}
							/>
							Winterwear
						</label>
					</div>
				</div>
			</div>

			{/* right side */}
			<div className="flex-1">
				<div className="flex justify-between mb-4 text-base sm:text-2xl">
					<Title text1={"ALL"} text2={"COLLECTIONS"} />
					{/* Product sort */}
					<select
						onChange={(e) => setSortType(e.target.value)}
						aria-label="Sort products"
						className="px-2 text-sm border-2 border-gray-300 dark:border-gray-700"
					>
						<option value="relavent">Sort by: Relavent</option>
						<option value="low-high">Sort by: Low to High</option>
						<option value="high-low">Sort by: High to Low</option>
					</select>
				</div>

				{/* Results summary */}
				<div className="flex items-center justify-between mb-3 text-sm text-gray-500 dark:text-gray-400">
					<p>
						{filterProducts.length}{" "}
						{filterProducts.length === 1 ? "product" : "products"}
						{search.trim() ? (
							<>
								{" "}
								for{" "}
								<span className="font-medium text-gray-700 dark:text-gray-200">
									“{search.trim()}”
								</span>
							</>
						) : null}
					</p>
					{search.trim() && (
						<button
							onClick={() => setSearch("")}
							className="text-gray-600 dark:text-gray-300 underline hover:text-black dark:hover:text-white"
						>
							Clear search
						</button>
					)}
				</div>

				{/* Map Products */}
				{filterProducts.length === 0 ? (
					<div className="py-20 text-center text-gray-500 dark:text-gray-400">
						<p className="text-lg font-medium text-gray-700 dark:text-gray-200">
							No products found
						</p>
						<p className="mt-2">
							{search.trim()
								? `Nothing matched “${search.trim()}”. Try a different term or clear the search.`
								: "Try removing a filter to see more products."}
						</p>
						<button
							onClick={() => setSearch("")}
							className="px-6 py-2 mt-6 text-sm text-white dark:text-gray-900 bg-black dark:bg-white"
						>
							Clear search
						</button>
					</div>
				) : (
					<>
						<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 gap-y-6">
							{visibleProducts.map((item, index) => (
								<ProductItem
									key={item._id || index}
									name={item.name}
									id={item._id}
									price={item.price}
									image={item.image}
								/>
							))}
						</div>
						{hasMore && (
							<div className="flex justify-center mt-10">
								<button
									type="button"
									onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
									className="px-8 py-3 text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
								>
									Load more ({filterProducts.length - visibleCount} remaining)
								</button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default Collection;
