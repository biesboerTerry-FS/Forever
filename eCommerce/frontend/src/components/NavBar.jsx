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
		localStorage.removeItem("demo-login");
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
				<li>
					<NavLink
						to="/profile"
						className={({ isActive }) =>
							`px-4 py-2 rounded-full transition-colors ${
								isActive
									? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
									: "hover:bg-gray-100 dark:hover:bg-gray-800"
							}`
						}
					>
						MY PROFILE
					</NavLink>
				</li>
			</ul>

			<div className="flex items-center gap-6">
				<ThemeToggle dark={dark} onToggle={toggleTheme} />
				<button
					type="button"
					onClick={openSearch}
					aria-label="Search products"
					className="flex items-center justify-center text-gray-700 transition-colors hover:text-gray-950 dark:text-gray-200 dark:hover:text-white"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-5 w-5" aria-hidden="true">
						<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
					</svg>
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
						className="flex items-center justify-center text-gray-700 transition-colors hover:text-gray-950 dark:text-gray-200 dark:hover:text-white"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-5 w-5" aria-hidden="true">
							<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
						</svg>
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
										navigate("/profile");
									}}
									className="text-left cursor-pointer hover:text-black dark:hover:text-white"
								>
									My profile
								</button>
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
					className="relative text-gray-700 transition-colors hover:text-gray-950 dark:text-gray-200 dark:hover:text-white"
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
						<p className="absolute -right-2 -bottom-1.5 min-w-[17px] rounded-full bg-rose-600 px-1 text-center text-[10px] font-semibold leading-[17px] text-white ring-2 ring-white dark:bg-rose-500 dark:ring-gray-900">
							{wishlist.length}
						</p>
					)}
				</Link>

				<Link
					to="/cart"
					className={`relative inline-flex text-gray-700 transition-transform duration-300 hover:text-gray-950 dark:text-gray-200 dark:hover:text-white ${cartBump ? "scale-125" : "scale-100"}`}
					aria-label={`Cart, ${cartCount} ${
						cartCount === 1 ? "item" : "items"
					}`}
					data-testid="cart-link"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-5 w-5" aria-hidden="true">
						<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
					</svg>
					{cartCount > 0 && (
						<p
							data-testid="cart-badge"
							className={`absolute -right-2 -bottom-1.5 min-w-[17px] rounded-full bg-rose-600 px-1 text-center text-[10px] font-semibold leading-[17px] text-white ring-2 ring-white transition-transform duration-300 dark:bg-rose-500 dark:ring-gray-900 ${cartBump ? "scale-110" : "scale-100"}`}
						>
							{cartCount}
						</p>
					)}
				</Link>
				<button
					type="button"
					onClick={() => setVisible(true)}
					aria-label="Open menu"
					aria-expanded={visible}
					className="flex items-center justify-center text-gray-700 dark:text-gray-200 sm:hidden"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-5 w-5" aria-hidden="true">
						<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
					</svg>
				</button>
			</div>
			{/* Sidebar menu for small screens */}
			<div
				aria-hidden={!visible}
				className={`fixed inset-0 z-[100] overflow-y-auto bg-white dark:bg-gray-900 transition-opacity duration-200 ${
					visible
						? "opacity-100"
						: "invisible opacity-0 pointer-events-none"
				}`}
			>
				<div className="flex min-h-full flex-col text-gray-600 dark:text-gray-300 pt-6">
					<button
						type="button"
						onClick={() => setVisible(false)}
						className="flex items-center gap-4 p-3 text-left"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-4 w-4" aria-hidden="true">
							<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
						</svg>
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
					<NavLink
						onClick={() => setVisible(false)}
						className="py-2 pl-6 border"
						to="/profile"
					>
						MY PROFILE
					</NavLink>
				</div>
			</div>
		</div>
	</header>
	);
};

export default NavBar;
