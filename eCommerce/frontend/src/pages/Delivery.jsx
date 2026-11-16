import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Title from "../components/Title";
import NewsletterBox from "../components/NewsletterBox";

const Delivery = () => {
	useEffect(() => {
		document.title = "Delivery & Shipping | Forever";
	}, []);

	return (
		<div className="border-t pt-14">
			<div className="mb-8 text-2xl">
				<Title text1={"DELIVERY &"} text2={"SHIPPING"} />
			</div>

			<p className="max-w-3xl text-gray-600 dark:text-gray-300">
				We work to get your order packed and on its way quickly. Below are our
				standard processing times, shipping options, tracking details, and
				delivery support information.
			</p>

			<div className="grid gap-6 my-10 md:grid-cols-2">
				<div className="border p-8">
					<h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-100">Order processing</h2>
					<ul className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300 list-disc list-inside">
						<li>Orders placed before 2:00 PM (local time) are typically processed the same business day.</li>
						<li>Orders placed after 2:00 PM, on weekends, or on holidays are processed the next business day.</li>
						<li>You’ll receive confirmation when your order is placed and when it ships.</li>
					</ul>
				</div>

				<div className="border p-8">
					<h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-100">Shipping options & rates</h2>
					<ul className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
						<li className="flex justify-between gap-4 border-b pb-2"><span>Standard (3–5 business days)</span><span className="font-medium text-gray-800 dark:text-gray-100">$10.00</span></li>
						<li className="flex justify-between gap-4 border-b pb-2"><span>Express (1–2 business days)</span><span className="font-medium text-gray-800 dark:text-gray-100">Calculated at checkout</span></li>
						<li className="flex justify-between gap-4"><span>International</span><span className="font-medium text-gray-800 dark:text-gray-100">Calculated at checkout</span></li>
					</ul>
					<p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
						Delivery times are estimates and may vary by destination, carrier capacity, weather, and customs processing.
					</p>
				</div>

				<div className="border p-8">
					<h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-100">Tracking your order</h2>
					<p className="text-sm text-gray-600 dark:text-gray-300">
						Sign in and visit <Link to="/orders" className="underline font-medium">My Orders</Link> to view your order status timeline
						(Placed, Packing, Shipped, Out for Delivery, Delivered). Tracking details are also sent by email when available.
					</p>
				</div>

				<div className="border p-8">
					<h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-100">Address changes & delivery issues</h2>
					<p className="text-sm text-gray-600 dark:text-gray-300">
						Need to update your address or report a delay? Contact us as soon as possible at <a href="mailto:contact@forever.com" className="underline">contact@forever.com</a> with your order number.
						Once an order has shipped, address changes may be limited by the carrier.
					</p>
				</div>
			</div>

			<div className="grid gap-6 mb-16 md:grid-cols-2">
				<div className="p-8 border bg-gray-50 dark:bg-gray-900">
					<h2 className="mb-3 text-lg font-medium text-gray-800 dark:text-gray-100">International duties & taxes</h2>
					<p className="text-sm text-gray-600 dark:text-gray-300">
						International orders may be subject to customs duties, taxes, or import fees charged by the destination country.
						These charges are the responsibility of the recipient unless stated otherwise at checkout.
					</p>
				</div>
				<div className="p-8 border bg-gray-50 dark:bg-gray-900">
					<h2 className="mb-3 text-lg font-medium text-gray-800 dark:text-gray-100">Need help?</h2>
					<p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
						If your package is delayed, missing, or arrives damaged, we’ll help you resolve it quickly.
					</p>
					<Link to="/contact" className="inline-block px-6 py-3 text-sm text-white bg-black dark:bg-white dark:text-gray-900">Contact Support</Link>
				</div>
			</div>

			<NewsletterBox />
		</div>
	);
};

export default Delivery;
