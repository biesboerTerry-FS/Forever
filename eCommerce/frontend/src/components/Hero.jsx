import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Hero = () => {
	return (
		<div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-brand-50 dark:bg-gray-900/40 shadow-soft">
			<div className="flex flex-col sm:flex-row">
				{/* Hero left side */}
				<div className="flex items-center justify-center w-full px-6 py-12 sm:w-1/2 sm:py-16 lg:py-20">
					<div className="max-w-md animate-slide-up">
						<div className="inline-flex items-center gap-2 px-3 py-1 mb-5 text-xs font-semibold tracking-wider uppercase rounded-full bg-white/80 dark:bg-gray-800/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-gray-700">
							<span className="w-2 h-2 rounded-full bg-accent-500" />
							New Season
						</div>
						<h1 className="text-4xl leading-[1.1] prata-regular sm:py-2 lg:text-6xl text-gray-900 dark:text-white text-balance">
							Latest Arrivals
						</h1>
						<p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300 max-w-sm">
							Discover new-season essentials designed for comfort, style, and everyday wear. Curated pieces that feel as good as they look.
						</p>
						<Link
							to="/collection"
							className="inline-flex items-center gap-3 mt-8 text-sm font-semibold tracking-wide text-gray-900 dark:text-gray-100 group"
						>
							<span className="px-6 py-3.5 text-white transition-all duration-300 bg-gray-900 dark:bg-white dark:text-gray-900 rounded-full shadow-elevated group-hover:bg-accent-500 group-hover:shadow-glow">
								SHOP NOW
							</span>
							<span className="w-8 md:w-11 h-[2px] bg-gray-900 dark:bg-gray-100 transition-all group-hover:w-12" />
						</Link>
					</div>
				</div>
				{/* Hero right side */}
				<div className="w-full sm:w-1/2 min-h-[320px] sm:min-h-[420px] lg:min-h-[520px]">
					<img
						className="object-cover w-full h-full transition-transform duration-700 hover:scale-[1.02]"
						src={assets.hero_img}
						alt="Woman modelling a Forever outfit"
					/>
				</div>
			</div>
		</div>
	);
};

export default Hero;
