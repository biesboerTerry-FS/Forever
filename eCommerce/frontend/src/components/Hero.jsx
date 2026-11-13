import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Hero = () => {
	return (
		<div className="flex flex-col border border-gray-400 dark:border-gray-600 sm:flex-row">
			{/* Hero left side */}
			<div className="flex items-center justify-center w-full py-10 sm:w-1/2 sm:py-0">
				<div className="text-[#414141] dark:text-gray-100">
					<div className="flex items-center gap-2">
						<p className="w-8 md:w-11 h-[2px] bg-[#414141] dark:bg-gray-400"></p>
						<p className="text-sm font-medium md:text-base">
							OUR BEST SELLERS
						</p>
					</div>
					<h1 className="text-3xl leading-relaxed prata-regular sm:py-3 lg:text-5xl">
						Latest Arrivals
					</h1>
					<Link
						to="/collection"
						className="inline-flex items-center gap-2 mt-2"
					>
						<span className="text-sm font-semibold md:text-base">SHOP NOW</span>
						<span className="w-8 md:w-11 h-[2px] bg-[#414141] dark:bg-gray-400" />
					</Link>
				</div>
			</div>
			{/* Hero right side */}
			<img
				className="w-full sm:w-1/2"
				src={assets.hero_img}
				alt="Woman modelling a Forever outfit"
			/>
		</div>
	);
};

export default Hero;
