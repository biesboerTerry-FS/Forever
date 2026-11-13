import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

const linkClass = ({ isActive }) =>
	`flex items-center gap-3 px-3 py-2.5 text-[15px] rounded-lg transition-colors ${
		isActive
			? "bg-pink-50 font-medium text-gray-900 dark:bg-pink-500/15 dark:text-pink-100"
			: "text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
	}`;

const Sidebar = () => {
	return (
		<aside className="w-[18%] min-h-screen p-4 pt-6">
			<div className="flex flex-col gap-1">
				<NavLink className={linkClass} to="/" end>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="1.6"
						stroke="currentColor"
						className="w-5 h-5 shrink-0"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
						/>
					</svg>
					<p className="hidden md:block">Dashboard</p>
				</NavLink>
				<NavLink className={linkClass} to="/add">
					<img className="w-5 h-5 shrink-0 dark:invert" src={assets.add_icon} alt="" />
					<p className="hidden md:block">Add Items</p>
				</NavLink>
				<NavLink className={linkClass} to="/list">
					<img className="w-5 h-5 shrink-0 dark:invert" src={assets.order_icon} alt="" />
					<p className="hidden md:block">List Items</p>
				</NavLink>
				<NavLink className={linkClass} to="/orders">
					<img className="w-5 h-5 shrink-0 dark:invert" src={assets.order_icon} alt="" />
					<p className="hidden md:block">Orders</p>
				</NavLink>
			</div>
		</aside>
	);
};

export default Sidebar;
