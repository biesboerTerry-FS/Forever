import React from "react";

const STEPS = [
	"Order Placed",
	"Packing",
	"Shipped",
	"Out For Delivery",
	"Delivered",
];

// Horizontal progress timeline for an order status.
const OrderTimeline = ({ status }) => {
	const current = Math.max(0, STEPS.indexOf(status));

	return (
		<div className="w-full py-3">
			<div className="flex items-start">
				{STEPS.map((step, index) => {
					const done = index <= current;
					const isLast = index === STEPS.length - 1;
					return (
						<div
							key={step}
							className={`flex items-start ${isLast ? "" : "flex-1"}`}
						>
							<div className="flex flex-col items-center w-20 text-center">
								<span
									className={`flex items-center justify-center w-6 h-6 text-[10px] rounded-full border ${
										done
											? "bg-black dark:bg-white text-white dark:text-gray-900 border-black dark:border-gray-300"
											: "bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-700"
									}`}
								>
									{done ? "✓" : index + 1}
								</span>
								<span
									className={`mt-2 text-[10px] leading-tight sm:text-xs ${
										done ? "text-gray-800 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"
									}`}
								>
									{step}
								</span>
							</div>
							{!isLast && (
								<div
									className={`h-[2px] mt-3 flex-1 ${
										index < current
											? "bg-black dark:bg-white"
											: "bg-gray-200 dark:bg-gray-700"
									}`}
								/>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default OrderTimeline;
