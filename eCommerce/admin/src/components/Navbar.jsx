import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import ThemeToggle from "./ThemeToggle";

const Navbar = ({ setToken, dark, setDark }) => {
	return (
		<header className="sticky top-0 z-20 flex items-center justify-between px-[4%] py-3 bg-white/90 backdrop-blur dark:bg-gray-900/90">
			<Link
				to="/"
				title="Back to dashboard"
				aria-label="Back to dashboard"
				className="flex items-center gap-3 px-1 py-1 rounded-lg transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
			>
				<img
					className="w-[max(10%,80px)] dark:brightness-0 dark:invert"
					src={assets.logo}
					alt="Forever"
				/>
				<span className="hidden text-[11px] font-medium uppercase tracking-[0.22em] text-gray-400 sm:block dark:text-gray-500">
					Admin
				</span>
			</Link>
			<div className="flex items-center gap-3">
				<ThemeToggle dark={dark} onToggle={() => setDark((value) => !value)} />
				<button
					onClick={() => setToken("")}
					className="px-5 py-2 text-xs font-medium text-white bg-gray-900 rounded-full transition-colors hover:bg-gray-700 sm:text-sm dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
				>
					Logout
				</button>
			</div>
		</header>
	);
};

export default Navbar;
