import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Title from "../components/Title";
import NewsletterBox from "../components/NewsletterBox";
import { assets } from "../assets/assets";

const About = () => {
	useEffect(() => {
		document.title = "About Us | Forever";
	}, []);

	return (
		<div>
			<div className="pt-8 text-2xl text-center border-t">
				<Title text1={"ABOUT"} text2={"US"} />
			</div>

			<div className="flex flex-col gap-16 my-10 md:flex-row">
				<img
					className="w-full md:max-w-[450px] object-cover"
					src={assets.about_img}
					alt="Clothing on a rack in the Forever studio"
				/>
				<div className="flex flex-col justify-center gap-6 text-gray-600 dark:text-gray-300 md:w-2/4">
					<p>
						Forever is a modern fashion destination built around timeless
						wardrobe essentials for women, men, and kids. We focus on pieces
						that feel current, wear well, and stay in your rotation long after
						a single season.
					</p>
					<p>
						From everyday basics to standout layers, our collections are curated
						for comfort, quality, and easy styling. We believe shopping should
						be simple — clear product details, smooth checkout, reliable
						delivery, and support when you need it.
					</p>
					<div>
						<h2 className="mb-2 font-semibold text-gray-800 dark:text-gray-100">
							Our Mission
						</h2>
						<p>
							To make great style accessible with a seamless online experience,
							thoughtful curation, and customer care you can count on.
						</p>
					</div>
					<div>
						<h2 className="mb-2 font-semibold text-gray-800 dark:text-gray-100">
							Our Vision
						</h2>
						<p>
							To become a trusted destination for versatile fashion essentials —
							where quality, convenience, and confidence come together in every
							order.
						</p>
					</div>
				</div>
			</div>

			<div className="py-4 text-xl">
				<Title text1={"WHY"} text2={"CHOOSE US"} />
			</div>

			<div className="flex flex-col mb-16 text-sm md:flex-row">
				<div className="flex flex-col gap-4 px-8 py-10 border md:px-12 sm:py-16 flex-1">
					<h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
						Quality You Can Feel
					</h3>
					<p className="text-gray-600 dark:text-gray-300">
						We prioritize fit, fabric, and finish so every piece looks good and
						holds up to everyday wear.
					</p>
				</div>
				<div className="flex flex-col gap-4 px-8 py-10 border md:px-12 sm:py-16 flex-1">
					<h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
						Easy, Secure Shopping
					</h3>
					<p className="text-gray-600 dark:text-gray-300">
						Browse, save favorites, track orders, and check out with a smooth
						experience across web and mobile.
					</p>
				</div>
				<div className="flex flex-col gap-4 px-8 py-10 border md:px-12 sm:py-16 flex-1">
					<h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
						Support That Cares
					</h3>
					<p className="text-gray-600 dark:text-gray-300">
						From sizing questions to delivery updates, our team is here to help
						before and after your purchase.
					</p>
				</div>
			</div>

			<div className="grid gap-6 mb-20 md:grid-cols-3">
				<div className="p-6 border bg-gray-50 dark:bg-gray-900">
					<p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">24/7</p>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Online storefront access</p>
				</div>
				<div className="p-6 border bg-gray-50 dark:bg-gray-900">
					<p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Fast</p>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Order processing and dispatch</p>
				</div>
				<div className="p-6 border bg-gray-50 dark:bg-gray-900">
					<p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">7-Day</p>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Return & exchange window</p>
				</div>
			</div>

			<div className="p-8 mb-16 border">
				<h2 className="mb-3 text-lg font-medium text-gray-800 dark:text-gray-100">Want to learn more?</h2>
				<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
					Explore our latest collections or reach out to our team for help with orders, sizing, and shipping.
				</p>
				<div className="flex flex-wrap gap-3">
					<Link to="/collection" className="px-6 py-3 text-sm text-white bg-black dark:bg-white dark:text-gray-900">Shop Collection</Link>
					<Link to="/contact" className="px-6 py-3 text-sm border border-gray-300 dark:border-gray-700">Contact Us</Link>
				</div>
			</div>

			<NewsletterBox />
		</div>
	);
};

export default About;
