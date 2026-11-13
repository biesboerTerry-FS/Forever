import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Footer = () => {
	return (
		<div>
			<div className="flex flex-col gap-10 my-10 mt-40 text-sm sm:grid sm:grid-cols-2 lg:grid-cols-[2.5fr_1fr_1.1fr_1.3fr] sm:items-start gap-x-8">
				<div>
					<img
						src={assets.logo}
						className="w-32 mb-5 dark:brightness-0 dark:invert"
						alt="Forever"
					/>
					<p className="w-full text-gray-600 dark:text-gray-300 md:w-5/6 lg:mt-12">
						Timeless wardrobe essentials, thoughtfully made. Forever
						curates quality clothing for women, men and kids — designed to
						be worn often and kept for years, not just a season.
					</p>
				</div>

				<div>
					<p className="mb-5 text-xl font-medium">COMPANY</p>
					<ul className="flex flex-col gap-2 text-gray-600 dark:text-gray-300 lg:mt-12">
						<li>
							<Link to="/" className="hover:text-black dark:hover:text-white">
								Home
							</Link>
						</li>
						<li>
							<Link to="/about" className="hover:text-black dark:hover:text-white">
								About Us
							</Link>
						</li>
						<li>
							<Link to="/delivery" className="hover:text-black dark:hover:text-white">
								Delivery &amp; Shipping
							</Link>
						</li>
						<li>
							<Link to="/privacy" className="hover:text-black dark:hover:text-white">
								Privacy Policy
							</Link>
						</li>
					</ul>
				</div>

				<div>
					<p className="mb-5 text-xl font-medium">CUSTOMER SERVICE</p>
					<ul className="flex flex-col gap-2 text-gray-600 dark:text-gray-300">
						<li>
							<Link to="/contact" className="hover:text-black dark:hover:text-white">
								Contact Us
							</Link>
						</li>
						<li>
							<Link to="/returns" className="hover:text-black dark:hover:text-white">
								Returns &amp; Exchanges
							</Link>
						</li>
						<li>
							<Link to="/terms" className="hover:text-black dark:hover:text-white">
								Terms of Service
							</Link>
						</li>
						<li>
							<Link to="/collection" className="hover:text-black dark:hover:text-white">
								Shop All
							</Link>
						</li>
						<li>
							<a href="/sitemap.xml" className="hover:text-black dark:hover:text-white">
								Sitemap
							</a>
						</li>
					</ul>
				</div>

				<div>
					<p className="mb-5 text-xl font-medium">GET IN TOUCH</p>
					<ul className="flex flex-col gap-2 text-gray-600 dark:text-gray-300 lg:mt-12">
						<li>Phone: +1 314 723 1421</li>
						<li>Email: contact@forever.com</li>
						<li>54709 Williams Station, Suite 350, Washington, USA</li>
						<li>Mon–Fri, 9:00 AM – 6:00 PM</li>
					</ul>
				</div>
			</div>
			<div>
				<hr />
				<p className="py-5 text-sm text-center text-gray-600 dark:text-gray-300">
					Copyright © 2026 Forever. All rights reserved.
				</p>
			</div>
		</div>
	);
};

export default Footer;
