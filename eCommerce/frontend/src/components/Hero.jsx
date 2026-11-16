import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Hero = () => {
	return (
		<div className="flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 sm:flex-row bg-gray-50/60 dark:bg-gray-900/40">
			{/* Hero left side */}
			<div className="flex items-center justify-center w-full px-6 py-12 sm:w-1/2 sm:py-16 lg:py-20">
				<div className="text-[#414141] dark:text-gray-100 max-w-md">
					<div className="flex items-center gap-3 mb-3">
						<span className="w-8 md:w-11 h-[2px] bg-[#414141] dark:bg-gray-400" />
						<p className="text-xs font-semibold tracking-[0.2em] md:text-sm text-gray-600 dark:text-gray-300">
							OUR BEST SELLERS
						</p>
					</div>
					<h1 className="text-4xl leading-tight prata-regular sm:py-2 lg:text-6xl text-gray-900 dark:text-white">
						Latest Arrivals
					</h1>
					<p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base max-w-sm">
						Discover new-season essentials designed for comfort, style, and everyday wear.
					</p>
					<Link
						to="/collection"
						className="inline-flex items-center gap-3 mt-6 text-sm font-semibold tracking-wide text-gray-900 dark:text-gray-100 group"
					>
						<span className="px-5 py-3 text-white transition-colors bg-black dark:bg-white dark:text-gray-900 group-hover:bg-gray-800 dark:group-hover:bg-gray-200">
							SHOP NOW
						</span>
						<span className="w-8 md:w-11 h-[2px] bg-[#414141] dark:bg-gray-400 transition-all group-hover:w-12" />
					</Link>
				</div>
			</div>
			{/* Hero right side */}
			<div className="w-full sm:w-1/2 min-h-[280px] sm:min-h-[420px] lg:min-h-[520px]">
				<img
					className="object-cover w-full h-full"
					src={assets.hero_img}
					alt="Woman modelling a Forever outfit"
				/>
			</div>
		</div>
	);
};

export default Hero;
