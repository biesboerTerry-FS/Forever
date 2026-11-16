import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Title from "../components/Title";
import NewsletterBox from "../components/NewsletterBox";

const Privacy = () => {
	useEffect(() => {
		document.title = "Privacy Policy | Forever";
	}, []);

	return (
		<div className="border-t pt-14">
			<div className="mb-8 text-2xl">
				<Title text1={"PRIVACY"} text2={"POLICY"} />
			</div>

			<p className="max-w-3xl text-gray-600 dark:text-gray-300">
				Forever values your privacy. This Privacy Policy explains what information we collect, how we use it,
				and the choices you have when using our website and services. <span className="font-medium">Last updated: November 2026.</span>
			</p>

			<div className="flex flex-col max-w-3xl gap-8 my-10 text-sm text-gray-600 dark:text-gray-300">
				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">1. Information we collect</h2>
					<ul className="flex flex-col gap-2 list-disc list-inside">
						<li><strong>Account information:</strong> name, email address, and account credentials (passwords are stored securely using hashing).</li>
						<li><strong>Order and delivery information:</strong> items purchased, shipping address, phone number, and order history.</li>
						<li><strong>Payment information:</strong> payments are processed by third-party providers (such as Stripe or Razorpay). We do not store full card details on our servers.</li>
						<li><strong>Communications:</strong> messages you send us for support, returns, or inquiries.</li>
						<li><strong>Technical and usage data:</strong> basic device/browser information and site usage needed for security, performance, and functionality.</li>
					</ul>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">2. How we use your information</h2>
					<ul className="flex flex-col gap-2 list-disc list-inside">
						<li>Create and manage your account and authenticate sign-ins.</li>
						<li>Process orders, payments, shipping, returns, and customer support requests.</li>
						<li>Send transactional communications (order confirmations, status updates, password reset emails).</li>
						<li>Improve site performance, prevent fraud, and maintain security.</li>
						<li>Send marketing communications only when you opt in (you can unsubscribe at any time).</li>
					</ul>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">3. Cookies, local storage, and analytics</h2>
					<p>
						We use essential cookies/local storage to support core functionality such as sign-in sessions, cart/wishlist preferences, and theme settings.
						We may also use analytics tools to understand site usage and improve the experience. You can control cookies through your browser settings,
						but disabling essential storage may affect site functionality.
					</p>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">4. Sharing your information</h2>
					<p className="mb-2">We share information only as needed to operate our services, including with:</p>
					<ul className="flex flex-col gap-2 list-disc list-inside">
						<li><strong>Payment providers</strong> (e.g., Stripe, Razorpay) to process payments securely.</li>
						<li><strong>Hosting and infrastructure providers</strong> (e.g., Vercel, database/image services) to run the site and store content.</li>
						<li><strong>Communication providers</strong> (e.g., email services) to send transactional messages.</li>
						<li><strong>Legal or safety reasons</strong> when required to comply with law or protect users and services.</li>
					</ul>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">5. Data retention and security</h2>
					<p>
						We retain personal information only as long as necessary for the purposes described in this policy, including legal, accounting, and fraud-prevention obligations.
						We use reasonable administrative and technical safeguards to protect your information, but no method of transmission or storage is completely secure.
					</p>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">6. Your choices and rights</h2>
					<p className="mb-2">Depending on your location, you may have rights to access, correct, delete, or export your personal information.</p>
					<ul className="flex flex-col gap-2 list-disc list-inside">
						<li>Update account details by signing in (where available) or contacting support.</li>
						<li>Request account/data deletion by emailing <a href="mailto:privacy@forever.com" className="underline">privacy@forever.com</a>.</li>
						<li>Opt out of marketing emails using unsubscribe options in those messages.</li>
					</ul>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-100">7. Contact us</h2>
					<p>
						For privacy questions or requests, contact <a href="mailto:privacy@forever.com" className="underline">privacy@forever.com</a> or visit our <Link to="/contact" className="underline">Contact page</Link>.
					</p>
				</section>
			</div>

			<NewsletterBox />
		</div>
	);
};

export default Privacy;
