import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Title from "../components/Title";
import NewsletterBox from "../components/NewsletterBox";

const Returns = () => {
	useEffect(() => {
		document.title = "Returns & Exchanges | Forever";
	}, []);

	return (
		<div className="border-t pt-14">
			<div className="mb-8 text-2xl">
				<Title text1={"RETURNS &"} text2={"EXCHANGES"} />
			</div>

			<p className="max-w-3xl text-gray-600 dark:text-gray-300">
				If something isn’t quite right, we’re here to help. You can request a
				return or exchange within <strong>7 days of delivery</strong>, subject to
				the conditions below.
			</p>

			<div className="grid gap-6 my-10 md:grid-cols-2">
				<div className="border p-8">
					<h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-100">Eligibility</h2>
					<ul className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300 list-disc list-inside">
						<li>Items must be unworn, unwashed, and in original condition.</li>
						<li>Original tags and packaging should be included.</li>
						<li>Proof of purchase (order number or confirmation email) is required.</li>
						<li>Return/exchange requests must be submitted within 7 days of delivery.</li>
					</ul>
				</div>

				<div className="border p-8">
					<h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-100">How to start a return or exchange</h2>
					<ol className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300 list-decimal list-inside">
						<li>Email <a href="mailto:returns@forever.com" className="underline font-medium">returns@forever.com</a> with your order number and item details.</li>
						<li>Tell us whether you want a refund or exchange (and preferred size/color if applicable).</li>
						<li>We’ll reply with next steps and return instructions.</li>
						<li>Once received and inspected, we’ll process your refund or exchange.</li>
					</ol>
				</div>

				<div className="border p-8">
					<h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-100">Refunds</h2>
					<p className="text-sm text-gray-600 dark:text-gray-300">
						Approved refunds are issued to the original payment method after inspection. Processing times vary by payment provider
						(typically 5–10 business days). Original shipping fees are non-refundable unless the item arrived damaged, defective, or incorrect.
					</p>
				</div>

				<div className="border p-8">
					<h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-100">Exchanges</h2>
					<p className="text-sm text-gray-600 dark:text-gray-300">
						Exchanges are subject to stock availability. If your preferred replacement is unavailable, we can offer an alternative item,
						store credit (where applicable), or a refund according to your original payment method.
					</p>
				</div>
			</div>

			<div className="grid gap-6 mb-16 md:grid-cols-2">
				<div className="p-8 border bg-gray-50 dark:bg-gray-900">
					<h2 className="mb-3 text-lg font-medium text-gray-800 dark:text-gray-100">Damaged or incorrect items</h2>
					<p className="text-sm text-gray-600 dark:text-gray-300">
						If your order arrives damaged or you receive the wrong item, contact us within 7 days of delivery with photos and your order number.
						We’ll prioritize a replacement or resolution.
					</p>
				</div>
				<div className="p-8 border bg-gray-50 dark:bg-gray-900">
					<h2 className="mb-3 text-lg font-medium text-gray-800 dark:text-gray-100">Non-returnable items</h2>
					<p className="text-sm text-gray-600 dark:text-gray-300">
						For hygiene and safety reasons, certain items (such as earrings, swimwear, and personal care products) may be final sale
						unless damaged or defective. Sale items may be eligible for exchange/store credit depending on the promotion.
					</p>
				</div>
			</div>

			<div className="p-8 mb-16 border">
				<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">Need help with a return?</h2>
				<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
					Our support team can help you with eligibility, exchanges, and order issues.
				</p>
				<div className="flex flex-wrap gap-3">
					<Link to="/contact" className="px-6 py-3 text-sm text-white bg-black dark:bg-white dark:text-gray-900">Contact Support</Link>
					<Link to="/delivery" className="px-6 py-3 text-sm border border-gray-300 dark:border-gray-700">Delivery & Shipping</Link>
				</div>
			</div>

			<NewsletterBox />
		</div>
	);
};

export default Returns;
