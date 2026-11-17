import React from "react";
import { Link } from "react-router-dom";

const PromoBanner = () => {
	return (
		<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white shadow-elevated">
			<div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full bg-accent-500/20 blur-3xl" />
			<div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
			<div className="relative flex flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center sm:px-10 sm:py-12">
				<div>
					<p className="text-xs font-bold tracking-widest uppercase text-accent-400">
						Limited Time
					</p>
					<h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
						Free shipping on orders over $75
					</h2>
					<p className="mt-2 text-sm text-gray-300 max-w-md">
						Use code FREESHIP at checkout. Stack with seasonal sale items for extra savings.
					</p>
				</div>
				<Link
					to="/collection"
					className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-gray-900 transition-transform bg-white rounded-full hover:scale-105"
				>
					Shop the sale →
				</Link>
			</div>
		</div>
	);
};

export default PromoBanner;
