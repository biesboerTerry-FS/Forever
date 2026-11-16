import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Title from "../components/Title";
import NewsletterBox from "../components/NewsletterBox";

const Terms = () => {
	useEffect(() => {
		document.title = "Terms of Service | Forever";
	}, []);

	return (
		<div className="border-t pt-14">
			<div className="mb-8 text-2xl">
				<Title text1={"TERMS OF"} text2={"SERVICE"} />
			</div>

			<p className="max-w-3xl text-gray-600 dark:text-gray-300">
				These Terms of Service govern your use of the Forever website and your purchases from our store.
				By accessing the site, creating an account, or placing an order, you agree to these terms.
				<span className="font-medium"> Last updated: November 2026.</span>
			</p>

			<div className="flex flex-col max-w-3xl gap-8 my-10 text-sm text-gray-600 dark:text-gray-300">
				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">1. Use of the site and accounts</h2>
					<p>
						You agree to provide accurate information and keep your account credentials secure. You are responsible for activity
						under your account. We may suspend or restrict access if we detect misuse, fraud, or violations of these terms.
					</p>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">2. Products, pricing, and availability</h2>
					<p>
						We strive to display product details, pricing, and availability accurately, but errors may occur. We reserve the right
						to correct errors, update information, or cancel orders affected by pricing/availability issues. If a paid order is cancelled,
						you will receive a refund according to the payment method and provider timelines.
					</p>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">3. Orders and payments</h2>
					<p className="mb-2">
						By placing an order, you authorize us (and our payment providers) to charge the selected payment method for the total amount shown at checkout.
					</p>
					<ul className="flex flex-col gap-2 list-disc list-inside">
						<li>Supported payment methods may include Cash on Delivery, Stripe, and Razorpay (subject to availability/configuration).</li>
						<li>Card/payment details are processed by third-party providers and are not stored on our servers.</li>
						<li>Orders may be subject to verification, fraud checks, or cancellation where necessary.</li>
					</ul>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">4. Shipping, delivery, returns, and exchanges</h2>
					<p>
						Shipping timelines, fees, delivery conditions, and return/exchange eligibility are described on our{" "}
						<Link to="/delivery" className="underline font-medium">Delivery & Shipping</Link> and{" "}
						<Link to="/returns" className="underline font-medium">Returns & Exchanges</Link> pages, which form part of these terms.
					</p>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">5. Promotions and communications</h2>
					<p>
						Promotional offers, discounts, and newsletter communications may be subject to additional terms. You can unsubscribe from marketing emails at any time.
						Transactional messages related to your account or orders may still be sent when necessary.
					</p>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">6. Intellectual property</h2>
					<p>
						All site content, branding, logos, text, graphics, and product imagery (unless otherwise stated) are owned by Forever or used with permission.
						You may not copy, reproduce, distribute, or exploit site content without prior written consent, except as permitted by law.
					</p>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">7. Limitation of liability</h2>
					<p>
						To the maximum extent permitted by law, Forever is not liable for indirect, incidental, special, or consequential damages arising from use of the site
						or purchase of products. Nothing in these terms excludes rights that cannot be excluded under applicable consumer law.
					</p>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">8. Changes and contact</h2>
					<p>
						We may update these terms from time to time. The latest version will be posted on this page.
						Questions? Contact us at <a href="mailto:contact@forever.com" className="underline">contact@forever.com</a> or visit our <Link to="/contact" className="underline">Contact page</Link>.
					</p>
				</section>
			</div>

			<NewsletterBox />
		</div>
	);
};

export default Terms;
