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
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="1.6"
						stroke="currentColor"
						className="w-5 h-5 shrink-0"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm0 5.25h.007v.008H3.75V12zm0 5.25h.007v.008H3.75v-.008z"
						/>
					</svg>
					<p className="hidden md:block">List Items</p>
				</NavLink>
				<NavLink className={linkClass} to="/orders">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
						<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.25 2.25 0 00-.659-1.591l-3.099-3.099A2.25 2.25 0 0015.526 9H14.25V5.625c0-.621-.504-1.125-1.125-1.125h-9A1.125 1.125 0 003 5.625v7.5M14.25 9h1.276a.75.75 0 01.53.22l2.724 2.724a.75.75 0 01.22.53v1.776" />
					</svg>
					<p className="hidden md:block">Orders</p>
				</NavLink>

				<div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-800">
					<p className="hidden px-3 mb-1 text-xs font-medium tracking-wide text-gray-400 uppercase md:block dark:text-gray-500">Team & Ops</p>
				</div>
				<NavLink className={linkClass} to="/employees"><span className="w-5 h-5 text-center shrink-0">👥</span><p className="hidden md:block">Employees</p></NavLink>
				<NavLink className={linkClass} to="/managers"><span className="w-5 h-5 text-center shrink-0">🧑‍💼</span><p className="hidden md:block">Managers</p></NavLink>
				<NavLink className={linkClass} to="/schedule"><span className="w-5 h-5 text-center shrink-0">🗓️</span><p className="hidden md:block">Schedule</p></NavLink>
				<NavLink className={linkClass} to="/learning"><span className="w-5 h-5 text-center shrink-0">🎓</span><p className="hidden md:block">Learning (Demo)</p></NavLink>
				<NavLink className={linkClass} to="/payroll"><span className="w-5 h-5 text-center shrink-0">💵</span><p className="hidden md:block">Payroll</p></NavLink>
				<NavLink className={linkClass} to="/reports"><span className="w-5 h-5 text-center shrink-0">📊</span><p className="hidden md:block">Reports</p></NavLink>
			</div>
		</aside>
	);
};

export default Sidebar;
