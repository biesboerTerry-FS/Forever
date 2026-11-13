import React from "react";
import { assets } from "../assets/assets";

const OurPolicy = () => {
	return (
		<div className="flex flex-col justify-around gap-12 py-20 text-xs text-center text-gray-700 dark:text-gray-200 sm:flex-row sm:gap-2 sm:text-sm md:text-base">
			<div>
				<img
					src={assets.exchange_icon}
					className="w-12 m-auto mb-5"
					alt="Easy exchange"
				/>
				<p className="font-semibold">Easy Exchange Policy</p>
				<p className="text-gray-400 dark:text-gray-500">
					We offer hassle free exchange policy
				</p>
			</div>
			<div>
				<img
					src={assets.quality_icon}
					className="w-12 m-auto mb-5"
					alt="7-day return"
				/>
				<p className="font-semibold">7-Days</p>
				<p className="text-gray-400 dark:text-gray-500">
					We provide a 7-day free return policy
				</p>
			</div>{" "}
			<div>
				<img
					src={assets.support_img}
					className="w-12 m-auto mb-5"
					alt="24/7 customer support"
				/>
				<p className="font-semibold">Best Customer Support</p>
				<p className="text-gray-400 dark:text-gray-500">We provide 24/7 customer support</p>
			</div>
		</div>
	);
};

export default OurPolicy;
