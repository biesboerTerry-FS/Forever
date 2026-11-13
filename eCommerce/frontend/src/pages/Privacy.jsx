import React from "react";
import Title from "../components/Title";
import NewsletterBox from "../components/NewsletterBox";

const Privacy = () => {
	return (
		<div className="border-t pt-14">
			<div className="mb-8 text-2xl">
				<Title text1={"PRIVACY"} text2={"POLICY"} />
			</div>

			<p className="max-w-3xl text-gray-600 dark:text-gray-300">
				Forever respects your privacy. This policy explains what information
				we collect when you shop with us, why we collect it, and the choices
				you have. It applies to our website, storefront and support
				channels. Last updated: January 2026.
			</p>

			<div className="flex flex-col max-w-3xl gap-8 my-10 text-sm text-gray-600 dark:text-gray-300">
				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">
						Information we collect
					</h2>
					<ul className="flex flex-col gap-1 list-disc list-inside">
						<li>
							<strong>Account details</strong> — your name, email address
							and a securely hashed password when you create an account.
						</li>
						<li>
							<strong>Order details</strong> — the items you buy, delivery
							address, phone number and order history.
						</li>
						<li>
							<strong>Payment information</strong> — handled directly by
							our payment providers (Stripe and Razorpay). We never store
							your full card number on our servers.
						</li>
						<li>
							<strong>Usage data</strong> — basic technical information
							such as browser type and pages visited, used to keep the
							site secure and improve it.
						</li>
					</ul>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">
						How we use your information
					</h2>
					<p>
						We use your information to create and secure your account,
						process and deliver orders, send order updates, respond to
						support requests, prevent fraud, and — only where you have
						opted in — send occasional marketing emails. You can
						unsubscribe from marketing at any time.
					</p>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">
						Cookies and local storage
					</h2>
					<p>
						We use a small amount of browser storage to keep you signed in
						and remember your cart. This storage is essential to the
						shopping experience and does not track you across other
						websites.
					</p>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">
						Sharing and retention
					</h2>
					<p>
						We share only the information needed to run the store: payment
						providers to process transactions, delivery partners to ship
						orders, and cloud hosting providers to operate the service. We
						retain order records for as long as required for accounting and
						legal purposes, then delete or anonymise them.
					</p>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">
						Your rights
					</h2>
					<p>
						You may request access to, correction of, or deletion of your
						personal data at any time by emailing{" "}
						<span className="font-medium">privacy@forever.com</span>. You
						can also close your account from the support channel, after
						which your profile is removed and order records are retained
						only where legally required.
					</p>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">
						Contact
					</h2>
					<p>
						Questions about this policy? Write to{" "}
						<span className="font-medium">privacy@forever.com</span> or
						Forever, 54709 Williams Station, Suite 350, Washington, USA.
					</p>
				</section>
			</div>

			<NewsletterBox />
		</div>
	);
};

export default Privacy;
