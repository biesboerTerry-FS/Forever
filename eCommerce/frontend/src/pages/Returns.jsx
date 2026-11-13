import React from "react";
import Title from "../components/Title";
import NewsletterBox from "../components/NewsletterBox";

const Returns = () => {
	return (
		<div className="border-t pt-14">
			<div className="mb-8 text-2xl">
				<Title text1={"RETURNS &"} text2={"EXCHANGES"} />
			</div>

			<p className="max-w-3xl text-gray-600 dark:text-gray-300">
				We want you to love everything you order from Forever. If something
				isn't quite right, you have 7 days from the delivery date to request
				a return or exchange.
			</p>

			<div className="grid gap-10 my-10 md:grid-cols-2">
				<div className="border p-8">
					<h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-100">
						Return eligibility
					</h2>
					<ul className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300 list-disc list-inside">
						<li>Items must be unworn, unwashed and in original condition.</li>
						<li>
							Original tags and packaging must be attached and intact.
						</li>
						<li>
							Proof of purchase — your order number or confirmation email
							— is required.
						</li>
						<li>
							Returns must be requested within 7 days of delivery.
						</li>
					</ul>
				</div>

				<div className="border p-8">
					<h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-100">
						How to start a return
					</h2>
					<ol className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300 list-decimal list-inside">
						<li>
							Email{" "}
							<span className="font-medium">returns@forever.com</span>{" "}
							with your order number and the item(s) you'd like to return.
						</li>
						<li>
							We'll reply within one business day with a return label and
							instructions.
						</li>
						<li>
							Drop the parcel at any listed carrier location within 5
							days of receiving the label.
						</li>
						<li>
							Once we receive and inspect the item, your refund or
							exchange is processed.
						</li>
					</ol>
				</div>

				<div className="border p-8">
					<h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-100">
						Refunds
					</h2>
					<p className="text-sm text-gray-600 dark:text-gray-300">
						Refunds are issued to the original payment method within 5–7
						business days of inspection. Cash-on-delivery orders are
						refunded by bank transfer. Original shipping fees are
						non-refundable unless the item arrived damaged or incorrect.
					</p>
				</div>

				<div className="border p-8">
					<h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-100">
						Exchanges
					</h2>
					<p className="text-sm text-gray-600 dark:text-gray-300">
						Prefer a different size or colour? Exchanges are free within
						the 7-day window and are subject to stock availability.
						Include your preferred size in your return email and we'll
						reserve it where possible.
					</p>
				</div>
			</div>

			<div className="p-8 border bg-gray-50 dark:bg-gray-900">
				<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">
					Non-returnable items
				</h2>
				<p className="text-sm text-gray-600 dark:text-gray-300">
					For hygiene and safety reasons, earrings, swimwear and personal
					care products cannot be returned unless they arrive damaged or
					defective. Sale items are eligible for exchange or store credit
					only.
				</p>
			</div>

			<div className="mt-10">
				<NewsletterBox />
			</div>
		</div>
	);
};

export default Returns;
