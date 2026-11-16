import React from "react";
import { assets } from "../assets/assets";

const policies = [
	{
		icon: assets.exchange_icon,
		alt: "Easy exchange",
		title: "Easy Exchange Policy",
		text: "Simple exchanges on eligible items for a hassle-free experience.",
	},
	{
		icon: assets.quality_icon,
		alt: "7-day return",
		title: "7-Day Returns",
		text: "Return eligible items within 7 days of delivery.",
	},
	{
		icon: assets.support_img,
		alt: "24/7 customer support",
		title: "Customer Support",
		text: "Friendly help for orders, sizing, shipping, and more.",
	},
];

const OurPolicy = () => {
	return (
		<div className="grid gap-6 py-16 text-center text-gray-700 dark:text-gray-200 sm:grid-cols-3 sm:gap-8 sm:py-20">
			{policies.map((policy) => (
				<div
					key={policy.title}
					className="px-4 py-6 border border-gray-100 sm:border-0 dark:border-gray-800"
				>
					<img src={policy.icon} className="w-11 m-auto mb-4 sm:w-12 sm:mb-5" alt={policy.alt} />
					<p className="font-semibold text-gray-900 dark:text-gray-100">{policy.title}</p>
					<p className="max-w-xs mx-auto mt-2 text-sm text-gray-500 dark:text-gray-400">{policy.text}</p>
				</div>
			))}
		</div>
	);
};

export default OurPolicy;
