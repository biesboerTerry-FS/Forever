import React, { useContext, useEffect, useRef, useState } from "react";
import { assets } from "../assets/assets.js";
import { NavLink, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { ShopContext } from "../context/ShopContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

const NavBar = () => {
	const [visible, setVisible] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	const [cartBump, setCartBump] = useState(false);
	const location = useLocation();

	const {
		setShowSearch,
		getCartCount,
		navigate,
		token,
		setToken,
		setCartItems,
		user,
		setUser,
		wishlist,
		setWishlist,
		dark,
		toggleTheme,
	} = useContext(ShopContext);

	const { isSignedIn, signOut } = useAuth();
	const cartCount = getCartCount();
	const prevCartCount = useRef(cartCount);

	useEffect(() => {
		if (cartCount > prevCartCount.current) {
			setCartBump(true);
			const timer = setTimeout(() => setCartBump(false), 350);
			prevCartCount.current = cartCount;
			return () => clearTimeout(timer);
		}
		prevCartCount.current = cartCount;
	}, [cartCount]);

	// Header search icon: open the collection page's search bar (and focus it).
	const openSearch = () => {
		setShowSearch(true);
		if (!location.pathname.includes("collection")) navigate("/collection");
	};

	const logout = async () => {
		// Clear local backend session immediately for responsive UI, then sign out of Clerk.
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setToken("");
		setUser(null);
		setCartItems({});
		setWishlist([]);
		setProfileOpen(false);
		if (isSignedIn) {
			await signOut();
		}
	};

	return (
		<header className="sticky top-0 z-50 py-4 font-medium glass w-screen ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]">
		<div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<Link to="/">
				<img
					src={assets.logo}
					className="w-36 dark:brightness-0 dark:invert"
					alt="Forever home"
				/>
			</Link>

			<ul className="hidden gap-1 text-sm font-medium text-gray-700 dark:text-gray-200 sm:flex">
				<li>
					<NavLink
						onClick={() => setVisible(false)}
						to="/"
						className={({ isActive }) =>
							`px-4 py-2 rounded-full transition-colors ${
								isActive
									? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
									: "hover:bg-gray-100 dark:hover:bg-gray-800"
							}`
						}
					>
						HOME
					</NavLink>
				</li>
				<li>
					<NavLink
						onClick={() => setVisible(false)}
						to="/collection"
						className={({ isActive }) =>
							`px-4 py-2 rounded-full transition-colors ${
								isActive
									? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
									: "hover:bg-gray-100 dark:hover:bg-gray-800"
							}`
						}
					>
						COLLECTION
					</NavLink>
				</li>
				<li>
					<NavLink
						onClick={() => setVisible(false)}
						to="/about"
						className={({ isActive }) =>
							`px-4 py-2 rounded-full transition-colors ${
								isActive
									? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
									: "hover:bg-gray-100 dark:hover:bg-gray-800"
							}`
						}
					>
						ABOUT
					</NavLink>
				</li>
				<li>
					<NavLink
						to="/contact"
						className={({ isActive }) =>
							`px-4 py-2 rounded-full transition-colors ${
								isActive
									? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
									: "hover:bg-gray-100 dark:hover:bg-gray-800"
							}`
						}
					>
						CONTACT
					</NavLink>
				</li>
			</ul>

			<div className="flex items-center gap-6">
				<ThemeToggle dark={dark} onToggle={toggleTheme} />
				<button
					type="button"
					onClick={openSearch}
					aria-label="Search products"
					className="flex items-center justify-center"
				>
					<img
						src={assets.search_icon}
						className="w-5 dark:invert"
						alt=""
					/>
				</button>

				<div className="relative group">
					<button
						type="button"
						onClick={() =>
							isSignedIn || token
								? setProfileOpen((open) => !open)
								: navigate("/login")
						}
						aria-label={isSignedIn || token ? "Account menu" : "Sign in"}
						aria-expanded={isSignedIn || token ? profileOpen : undefined}
						className="flex items-center justify-center"
					>
						<img
							src={assets.profile_icon}
							className="w-5 dark:invert"
							alt=""
						/>
					</button>
					{/* Dropdown menu */}
					{(isSignedIn || token) && (
						<div
							className={`absolute right-0 pt-4 dropdown-menu ${
								profileOpen ? "block" : "hidden group-hover:block group-focus-within:block"
							}`}
						>
							<div className="flex flex-col gap-2 px-5 py-3 text-gray-500 dark:text-gray-400 rounded w-44 bg-slate-100 dark:bg-gray-800">
								<p className="font-medium text-gray-800 dark:text-gray-100">
									Hi, {user?.name?.split(" ")[0] || "there"}
								</p>
								<button
									type="button"
									onClick={() => {
										setProfileOpen(false);
										navigate("/orders");
									}}
									className="text-left cursor-pointer hover:text-black dark:hover:text-white"
								>
									Orders
								</button>
								<button
									type="button"
									onClick={() => {
										setProfileOpen(false);
										navigate("/wishlist");
									}}
									className="text-left cursor-pointer hover:text-black dark:hover:text-white"
								>
									Wishlist
								</button>
								<button
									type="button"
									className="text-left cursor-pointer hover:text-black dark:hover:text-white"
									onClick={logout}
								>
									Logout
								</button>
							</div>
						</div>
					)}
				</div>

				<Link
					to="/wishlist"
					className="relative"
					aria-label="Wishlist"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="1.6"
						stroke="currentColor"
						className="w-5 h-5"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
						/>
					</svg>
					{wishlist.length > 0 && (
						<p className="absolute right-[-6px] bottom-[-5px] w-4 text-center leading-4 bg-black dark:bg-white text-white dark:text-gray-900 aspect-square rounded-full text-[8px]">
							{wishlist.length}
						</p>
					)}
				</Link>

				<Link
					to="/cart"
					className={`relative inline-flex transition-transform duration-300 ${cartBump ? "scale-125" : "scale-100"}`}
					aria-label={`Cart, ${cartCount} ${
						cartCount === 1 ? "item" : "items"
					}`}
				>
					<img
						src={assets.cart_icon}
						className="w-5 min-w-5 dark:invert"
						alt=""
					/>
					<p
						className={`absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black dark:bg-white text-white dark:text-gray-900 aspect-square rounded-full text-[8px] transition-transform duration-300 ${cartBump ? "scale-110" : "scale-100"}`}
					>
						{cartCount}
					</p>
				</Link>
				<button
					type="button"
					onClick={() => setVisible(true)}
					aria-label="Open menu"
					aria-expanded={visible}
					className="flex items-center justify-center sm:hidden"
				>
					<img
						src={assets.menu_icon}
						className="w-5 dark:invert"
						alt=""
					/>
				</button>
			</div>
			{/* Sidebar menu for small screens */}
			<div
				aria-hidden={!visible}
				className={`absolute top-0 right-0 bottom-0 z-50 overflow-hidden bg-white dark:bg-gray-900 transition-all ${
					visible ? "w-full" : "w-0 invisible"
				}`}
			>
				<div className="flex flex-col text-gray-600 dark:text-gray-300">
					<button
						type="button"
						onClick={() => setVisible(false)}
						className="flex items-center gap-4 p-3 text-left"
					>
						<img
							className="h-4 rotate-180"
							src={assets.dropdown_icon}
							alt=""
						/>
						<p>Back</p>
					</button>
					<NavLink
						onClick={() => setVisible(false)}
						className="py-2 pl-6 border"
						to="/"
					>
						HOME
					</NavLink>
					<NavLink
						onClick={() => setVisible(false)}
						className="py-2 pl-6 border"
						to="/collection"
					>
						COLLECTION
					</NavLink>
					<NavLink
						onClick={() => setVisible(false)}
						className="py-2 pl-6 border"
						to="/about"
					>
						ABOUT
					</NavLink>
					<NavLink
						onClick={() => setVisible(false)}
						className="py-2 pl-6 border"
						to="/contact"
					>
						CONTACT
					</NavLink>
				</div>
			</div>
		</div>
	</header>
	);
};

export default NavBar;
