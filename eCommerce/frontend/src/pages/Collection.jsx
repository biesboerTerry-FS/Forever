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
		<div className="flex flex-col gap-6 pt-8 border-t sm:pt-10 sm:flex-row sm:gap-8 lg:gap-10">
			{/* Filter options */}
			<aside className="w-full sm:w-60 lg:w-64 sm:shrink-0">
				<button
					type="button"
					onClick={() => setShowFilter(!showFilter)}
					aria-expanded={showFilter}
					className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium tracking-wide border border-gray-200 sm:justify-start sm:gap-2 sm:px-0 sm:py-0 sm:border-0 sm:text-xl sm:tracking-normal dark:border-gray-800"
				>
					<span>FILTERS</span>
					<img
						className={`h-3 transition-transform sm:hidden ${showFilter ? "rotate-90" : ""}`}
						src={assets.dropdown_icon}
						alt=""
					/>
				</button>

				<div className={`${showFilter ? "mt-3 space-y-4" : "hidden"} sm:block sm:mt-6 sm:space-y-5`}>
					{/* category filter */}
					<div className="p-4 border border-gray-200 dark:border-gray-800 sm:p-5">
						<p className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">CATEGORIES</p>
						<div className="flex flex-col gap-2.5 text-sm text-gray-700 dark:text-gray-200">
							<label className="flex items-center gap-2 cursor-pointer">
								<input className="w-4 h-4 accent-black dark:accent-white" type="checkbox" value={"Men"} onChange={toggleCategory} />
								Men
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<input className="w-4 h-4 accent-black dark:accent-white" type="checkbox" value={"Women"} onChange={toggleCategory} />
								Women
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<input className="w-4 h-4 accent-black dark:accent-white" type="checkbox" value={"Kids"} onChange={toggleCategory} />
								Kids
							</label>
						</div>
					</div>

					{/* Subcategory filter */}
					<div className="p-4 border border-gray-200 dark:border-gray-800 sm:p-5">
						<p className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">TYPE</p>
						<div className="flex flex-col gap-2.5 text-sm text-gray-700 dark:text-gray-200">
							<label className="flex items-center gap-2 cursor-pointer">
								<input className="w-4 h-4 accent-black dark:accent-white" type="checkbox" value={"Topwear"} onChange={toggleSubCategory} />
								Topwear
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<input className="w-4 h-4 accent-black dark:accent-white" type="checkbox" value={"Bottomwear"} onChange={toggleSubCategory} />
								Bottomwear
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<input className="w-4 h-4 accent-black dark:accent-white" type="checkbox" value={"Winterwear"} onChange={toggleSubCategory} />
								Winterwear
							</label>
						</div>
					</div>
				</div>
			</aside>

			{/* right side */}
			<div className="flex-1 min-w-0">
				<div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<Title text1={"ALL"} text2={"COLLECTIONS"} />
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Browse our latest styles and everyday essentials.
						</p>
					</div>
					{/* Product sort */}
					<div className="flex items-center gap-2">
						<label htmlFor="sort-products" className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
							Sort by
						</label>
						<select
							id="sort-products"
							onChange={(e) => setSortType(e.target.value)}
							aria-label="Sort products"
							className="px-3 py-2 text-sm bg-white border border-gray-300 dark:bg-gray-950 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
						>
							<option value="relavent">Relevant</option>
							<option value="low-high">Price: Low to High</option>
							<option value="high-low">Price: High to Low</option>
						</select>
					</div>
				</div>

				{/* Results summary */}
				<div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 text-sm border-b border-gray-200 text-gray-500 dark:text-gray-400 dark:border-gray-800">
					<p>
						Showing <span className="font-medium text-gray-800 dark:text-gray-100">{Math.min(visibleCount, filterProducts.length)}</span> of{" "}
						<span className="font-medium text-gray-800 dark:text-gray-100">{filterProducts.length}</span>{" "}
						{filterProducts.length === 1 ? "product" : "products"}
						{search.trim() ? (
							<>
								{" "}for <span className="font-medium text-gray-700 dark:text-gray-200">“{search.trim()}”</span>
							</>
						) : null}
					</p>
					{search.trim() && (
						<button
							onClick={() => setSearch("")}
							className="text-gray-700 underline dark:text-gray-200 hover:text-black dark:hover:text-white"
						>
							Clear search
						</button>
					)}
				</div>

				{/* Map Products */}
				{filterProducts.length === 0 ? (
					<div className="px-6 py-16 text-center border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400">
						<p className="text-lg font-medium text-gray-800 dark:text-gray-100">No products found</p>
						<p className="max-w-md mx-auto mt-2 text-sm">
							{search.trim()
								? `Nothing matched “${search.trim()}”. Try a different search term or adjust your filters.`
								: "Try adjusting or clearing your filters to see more products."}
						</p>
						{search.trim() ? (
							<button
								onClick={() => setSearch("")}
								className="px-6 py-2.5 mt-6 text-sm text-white bg-black dark:text-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200"
							>
								Clear search
							</button>
						) : null}
					</div>
				) : (
					<>
						<div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 sm:gap-x-6">
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
							<div className="flex justify-center mt-12">
								<button
									type="button"
									onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
									className="px-8 py-3 text-sm font-medium transition-colors border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
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
