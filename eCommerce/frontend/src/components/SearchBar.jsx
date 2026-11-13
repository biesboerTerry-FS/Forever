import React, { useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";

const SearchBar = () => {
	const { search, setSearch, showSearch, setShowSearch } =
		useContext(ShopContext);
	const location = useLocation();
	const inputRef = useRef(null);

	// The search bar lives on the collection page and appears on any page
	// while the collection is open.
	const visible = location.pathname.includes("collection");

	useEffect(() => {
		if (!visible) setShowSearch(false);
	}, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

	// When the header search icon is clicked we land here with showSearch,
	// so focus the input automatically.
	useEffect(() => {
		if (visible && showSearch) inputRef.current?.focus();
	}, [visible, showSearch]);

	if (!visible) return null;

	return (
		<div className="border-t border-b bg-gray-50 dark:bg-gray-900">
			<div className="flex items-center gap-2 py-2 sm:mx-0">
				<div className="inline-flex items-center justify-center w-full gap-2 px-5 py-2 mx-3 text-center border border-gray-400 dark:border-gray-600 rounded-full sm:w-1/2">
					<input
						ref={inputRef}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="flex-1 text-sm bg-transparent outline-none"
						type="text"
						placeholder="Search products, categories…"
						aria-label="Search products"
					/>
					{search && (
						<button
							type="button"
							onClick={() => setSearch("")}
							className="text-lg leading-none text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
							aria-label="Clear search"
						>
							×
						</button>
					)}
					<img className="w-4 dark:invert" src={assets.search_icon} alt="" />
				</div>
			</div>
		</div>
	);
};

export default SearchBar;
