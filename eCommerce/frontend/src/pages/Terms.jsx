import React from "react";
import Title from "../components/Title";
import NewsletterBox from "../components/NewsletterBox";

const Terms = () => {
	return (
		<div className="border-t pt-14">
			<div className="mb-8 text-2xl">
				<Title text1={"TERMS OF"} text2={"SERVICE"} />
			</div>

			<p className="max-w-3xl text-gray-600 dark:text-gray-300">
				These terms govern your use of the Forever website and the purchase
				of products from our store. By placing an order or creating an
				account you agree to them. Last updated: January 2026.
			</p>

			<div className="flex flex-col max-w-3xl gap-8 my-10 text-sm text-gray-600 dark:text-gray-300">
				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">
						Accounts
					</h2>
					<p>
						You are responsible for keeping your login details secure and
						for all activity that happens under your account. Provide
						accurate information when you register — we use it to deliver
						your orders and contact you about them.
					</p>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">
						Orders and pricing
					</h2>
					<p>
						All prices are shown in US dollars and include applicable
						taxes where required. We reserve the right to cancel an order
						if an item is mispriced, out of stock, or if we suspect fraud.
						If we cancel a paid order, you will be refunded in full.
					</p>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">
						Payments
					</h2>
					<p>
						We accept Cash on Delivery, Stripe and Razorpay. Card details
						are entered on our payment providers' secure checkout pages and
						are never stored by Forever. Your order is confirmed once
						payment (or, for COD, the order itself) is accepted.
					</p>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">
						Shipping, returns and exchanges
					</h2>
					<p>
						Delivery timelines, rates and the 7-day return window are
						described on our{" "}
						<span className="font-medium">Delivery &amp; Shipping</span> and{" "}
						<span className="font-medium">Returns &amp; Exchanges</span>{" "}
						pages, which form part of these terms.
					</p>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">
						Intellectual property
					</h2>
					<p>
						The Forever name, logo, product photography and site content
						are owned by Forever or used with permission. You may not copy,
						reproduce or resell them without our written consent.
					</p>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">
						Limitation of liability
					</h2>
					<p>
						To the fullest extent permitted by law, Forever is not liable
						for indirect or consequential losses arising from use of the
						site. Nothing in these terms limits your statutory rights as a
						consumer.
					</p>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">
						Changes and contact
					</h2>
					<p>
						We may update these terms from time to time; the current
						version is always published here. Questions? Email{" "}
						<span className="font-medium">contact@forever.com</span>.
					</p>
				</section>
			</div>

			<NewsletterBox />
		</div>
	);
};

export default Terms;
