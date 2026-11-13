import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] py-20 text-center">
			<p className="text-7xl font-semibold text-gray-800 dark:text-gray-100">404</p>
			<h1 className="mt-4 text-2xl font-medium text-gray-700 dark:text-gray-200">
				This page went out of style
			</h1>
			<p className="max-w-md mt-3 text-gray-500 dark:text-gray-400">
				The page you're looking for doesn't exist or may have moved. Let's
				get you back to something you'll love.
			</p>
			<div className="flex gap-3 mt-8">
				<Link
					to="/"
					className="px-8 py-3 text-sm text-white dark:text-gray-900 bg-black dark:bg-white"
				>
					BACK HOME
				</Link>
				<Link
					to="/collection"
					className="px-8 py-3 text-sm border border-black dark:border-gray-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-gray-900"
				>
					SHOP ALL
				</Link>
			</div>
		</div>
	);
};

export default NotFound;
