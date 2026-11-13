import React from "react";
import Title from "../components/Title";
import NewsletterBox from "../components/NewsletterBox";

const Delivery = () => {
	return (
		<div className="border-t pt-14">
			<div className="mb-8 text-2xl">
				<Title text1={"DELIVERY &"} text2={"SHIPPING"} />
			</div>

			<p className="max-w-3xl text-gray-600 dark:text-gray-300">
				Every Forever order is packed by hand and dispatched from our
				fulfilment studio within one business day. Below you'll find
				everything you need to know about how and when your order will
				arrive.
			</p>

			<div className="grid gap-10 my-10 md:grid-cols-2">
				<div className="border p-8">
					<h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-100">
						Processing times
					</h2>
					<ul className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
						<li>
							Orders placed before 2:00 PM local time are picked and
							packed the same business day.
						</li>
						<li>
							Orders placed after 2:00 PM, on weekends or on public
							holidays ship the next business day.
						</li>
						<li>
							You'll receive a confirmation email as soon as your parcel
							leaves our studio.
						</li>
					</ul>
				</div>

				<div className="border p-8">
					<h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-100">
						Shipping rates
					</h2>
					<ul className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
						<li className="flex justify-between border-b pb-2">
							<span>Standard delivery (3–5 business days)</span>
							<span className="font-medium text-gray-800 dark:text-gray-100">$10.00</span>
						</li>
						<li className="flex justify-between border-b pb-2">
							<span>Express delivery (1–2 business days)</span>
							<span className="font-medium text-gray-800 dark:text-gray-100">
								Calculated at checkout
							</span>
						</li>
						<li className="flex justify-between">
							<span>International delivery</span>
							<span className="font-medium text-gray-800 dark:text-gray-100">
								Calculated at checkout
							</span>
						</li>
					</ul>
					<p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
						A flat delivery fee of $10 is added to every order at
						checkout. Duties and taxes for international orders are the
						responsibility of the recipient.
					</p>
				</div>

				<div className="border p-8">
					<h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-100">
						Tracking your order
					</h2>
					<p className="text-sm text-gray-600 dark:text-gray-300">
						Sign in and open <span className="font-medium">My Orders</span>{" "}
						to see the live status of every purchase — from Order Placed
						and Packing through to Out for Delivery and Delivered. Tracking
						details are also included in your dispatch email.
					</p>
				</div>

				<div className="border p-8">
					<h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-100">
						Missed or delayed deliveries
					</h2>
					<p className="text-sm text-gray-600 dark:text-gray-300">
						If your parcel hasn't arrived within two business days of the
						estimated delivery date, contact us at{" "}
						<span className="font-medium">contact@forever.com</span> with
						your order number. We'll trace the shipment with the carrier
						and, where possible, send a replacement right away.
					</p>
				</div>
			</div>

			<NewsletterBox />
		</div>
	);
};

export default Delivery;
