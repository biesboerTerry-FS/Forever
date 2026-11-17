import React from "react";

const ProductSkeleton = ({ count = 5 }) => {
	return (
		<div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-x-6">
			{Array.from({ length: count }).map((_, index) => (
				<div key={index} className="animate-pulse">
					<div className="w-full bg-gray-200 rounded-xl aspect-[4/5] dark:bg-gray-800" />
					<div className="pt-4 space-y-2">
						<div className="h-4 bg-gray-200 rounded dark:bg-gray-800 w-3/4" />
						<div className="h-4 bg-gray-200 rounded dark:bg-gray-800 w-1/4" />
					</div>
				</div>
			))}
		</div>
	);
};

export default ProductSkeleton;
